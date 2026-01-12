# File Name: violation.py
# Description: 평가 가이드 위반 로직
#
# history: 
# 2025/12/27 - 승민 최초 작성
#
# @author: 승민

from typing import List, Dict
from pydantic import BaseModel
from collections import Counter

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
import json
import re

# 가이드 위반 데이터 타입
class GuideViolation(BaseModel):
    evaluationTemplateId: int
    evaluationTemplateName: str
    managerName: str
    departmentName: str
    violations: List[dict]

# 평가 가이드 벡터화시키는 함수
def build_guide_vectorstore(guide_text: str):
    # 텍스트 분할: 가이드 내용을 400자 단위로 쪼갬, 50자 겹침(문맥 손실 방지)
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50
    )

    docs = splitter.split_text(guide_text)

    # 가이드 내용 조각을 벡터로 변환
    embeddings = OpenAIEmbeddings()

    # 가이드 내용 조각을 벡터 DB에 저장
    return FAISS.from_texts(docs, embeddings)

# LLM 모델에서 출력되는 값을 안정화 시키는 함수
def clean_llm_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```json", "", text)
        text = re.sub(r"^```", "", text)
        text = re.sub(r"```$", "", text)
        text = text.strip()
    return text


# 프롬프트
violation_prompt = ChatPromptTemplate.from_template("""
너는 기업 인사팀의 평가 감사 AI다.
너의 역할은 '위반 여부를 판단'하는 것이다.
설명이나 요약은 하지 않는다.

아래 [고정 등급 기준]과 [평가 가이드 발췌],
그리고 [평가 데이터]를 비교하여
**명백한 평가 가이드 위반만 식별하라.**

[고정 등급 기준]
- S: 81~100
- A: 61~80
- B: 41~60
- C: 21~40
- F: 0~20

위반으로 판단하는 경우는 아래뿐이다:
1. 점수가 해당 등급의 점수 범위를 벗어난 경우
2. 실적 내용과 점수/등급이 명백히 불일치하는 경우
3. 평가 코멘트가 실적과 논리적으로 연결되지 않는 경우

❗ 아래 조건은 **절대 위반이 아니다**:
- 점수와 등급이 기준에 정확히 부합하는 경우
- 실적·점수·등급·코멘트가 서로 일관된 경우
                                                    
❗ 출력 문장 규칙 (매우 중요):
- 어려운 용어 사용 금지
- “점수 범위”, “기준 불일치”, “논리적 일관성” 같은 표현 금지
- **사람에게 설명하듯 쉽게 작성**

[평가 가이드 발췌]
{guide_context}

[평가 데이터]
{evaluation_data}

출력 규칙:
- 위반이 하나도 없으면 정확히 다음 문장만 출력:
  "위반 없음"
- 위반이 있는 경우에만 JSON 배열 출력
- **위반이 아닌 항목은 JSON에 절대 포함하지 말 것**
- 설명용 문장, 판단 요약, 중간 해설 절대 금지

JSON 형식:
[
  {{
    "피평가자": "...",
    "항목": "...",
    "위반 사유": "쉽고 간단한 문장으로 설명"
  }}
]
""")

# 평가 가이드 위반 분석 함수
def analyze_guide_violations(
    template: Dict,
    guide_text: str,
    llm: ChatOpenAI
) -> List[GuideViolation]:

    vectorstore = build_guide_vectorstore(guide_text)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    results: List[GuideViolation] = []

    for ev in template["evaluations"]:
        evaluation_lines = []
        all_ranks = []

        for e in ev["evaluatees"]:
            for item in e["formItems"]:
                rank = item.get("formItemRank")
                if rank:
                    all_ranks.append(rank)

                evaluation_lines.append(
                    f"""
                    피평가자: {e['evaluationEvaluateeName']}
                    항목: {item['formItemName']}
                    실적: {item.get('formItemEvaluateePerformance')}
                    점수: {item.get('formItemScore')}
                    등급: {rank}
                    코멘트: {item.get('formItemComment')}
                    """
                )

        evaluation_text = "\n".join(evaluation_lines)

        guide_docs = retriever.invoke(evaluation_text)
        guide_context = "\n".join(d.page_content for d in guide_docs)

        prompt = violation_prompt.format(
            guide_context=guide_context,
            evaluation_data=evaluation_text
        )

        response = llm.invoke(prompt).content.strip()
        item_violations = []

        if response != "위반 없음":
            cleaned = clean_llm_json(response)
            if cleaned.startswith("["):
                try:
                    item_violations = json.loads(cleaned)
                except json.JSONDecodeError:
                    pass

        pattern_violations = []
        total_items = len(all_ranks)

        if total_items >= 10:
            counter = Counter(all_ranks)
            for grade, count in counter.items():
                ratio = count / total_items
                if ratio >= 0.85:
                    pattern_violations.append({
                        "피평가자": "전체",
                        "항목": "평가자 등급 분포",
                        "위반 사유": (
                            f"{grade} 등급이 전체 항목의 {int(ratio*100)}%로 "
                            "너무 많이 사용되었습니다."
                        )
                    })

        merged = item_violations + pattern_violations

        if not merged:
            continue

        results.append(
            GuideViolation(
                evaluationTemplateId=template["evaluationTemplateId"],
                evaluationTemplateName=template["evaluationTemplateName"],
                managerName=ev["evaluationManagerName"],
                departmentName=ev["evaluationDepartmentName"],
                violations=merged
            )
        )

    return results