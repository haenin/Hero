# File Name: promotion.py
# Description: 승진 추천 분석 로직
#
# history: 
# 2025/12/27 - 승민 최초 작성
#
# @author: 승민

from typing import List, Dict
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from collections import defaultdict
from statistics import mean

# 승진 추천 대상자 타입 
class PromotionCandidate(BaseModel):
    name: str
    department: str
    current_grade: str
    recommended_grade: str
    growth_rate: float
    core_competencies: List[str]
    reason: str

# 승진 추천 대상자 결과 데이터 타입
class PromotionLLMResult(BaseModel):
    core_competencies: List[str]
    reason: str

# AI의 출력을 Pydantic 모델(BaseModel)에 맞게 구조화된 데이터로 변환
promotion_output_parser = PydanticOutputParser(
    pydantic_object=PromotionLLMResult
)

# 직급 순서 데이터
GRADE_ORDER = ["사원", "주임", "대리", "과장", "차장", "부장"]

# 추천 직급 계산 함수
def recommend_grade(current: str) -> str:
    if current not in GRADE_ORDER:
        return current
    idx = GRADE_ORDER.index(current)
    return GRADE_ORDER[idx + 1] if idx + 1 < len(GRADE_ORDER) else current


# 승진 추천 대상자 추출 함수
def extract_top_candidates(dashboard_data: List[Dict]) -> List[Dict]:
    """
    모든 평가 데이터를 기반으로
    사원별 '평균 성장량(추세)'이 가장 높은 상위 3명 추출
    """

    # 평가 템플릿 시간순 정렬
    templates = sorted(
        dashboard_data,
        key=lambda x: x["evaluationTemplateId"]
    )

    # 사원별 점수 시계열
    score_history = defaultdict(list)
    employee_info = {}

    # 모든 평가에서 점수 수집
    for t in templates:
        for ev in t["evaluations"]:
            for e in ev["evaluatees"]:
                score = e["evaluationEvaluateeTotalScore"]
                if score is None:
                    continue

                eid = e["evaluationEvaluateeId"]
                score_history[eid].append(score)

                # 기본 정보 저장
                employee_info[eid] = {
                    "name": e["evaluationEvaluateeName"],
                    "department": e["evaluationEvaluateeDepartmentName"],
                    "grade": e["evaluationEvaluateeGrade"],
                    "formItems": e["formItems"]
                }

    growth_candidates = []

    for eid, scores in score_history.items():
        # 최소 2회 이상 평가된 사람만 대상
        if len(scores) < 2:
            continue

        # 성장세 계산 (평균 분기 증가량)
        deltas = [
            scores[i] - scores[i - 1]
            for i in range(1, len(scores))
        ]

        avg_growth = mean(deltas)

        growth_candidates.append({
            **employee_info[eid],
            "growth": round(avg_growth, 2)
        })

    # 성장세 기준 정렬
    return sorted(
        growth_candidates,
        key=lambda x: x["growth"],
        reverse=True
    )[:3]


# LLM에 보낼 프롬프트 설계
promotion_prompt = ChatPromptTemplate.from_template("""
너는 기업 인사팀의 승진 심사 AI야.

아래 사원 정보를 기반으로
- 핵심 역량 (1~3개)
- 승진 추천 사유
를 작성해.

{format_instructions}

[사원 정보]
이름: {name}
부서: {department}
현재 직급: {grade}
전 분기 대비 성장률: {growth_rate}%

[평가 항목 점수]
{items}

조건:
- 반드시 JSON 형식으로만 응답
- 한국어
- 실무 인사평가 스타일
- 추상적인 표현 금지
""")