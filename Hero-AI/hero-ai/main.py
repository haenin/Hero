# File Name: main.py 
# Description: 파이썬 서버 실행 파일 
#
# history: 
# 2025/12/20 - 승민 최초 작성
#
# @author: 승민



import os
import uvicorn
from typing import List
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from langchain_openai import ChatOpenAI

# 사원 분석 (analysis.py)
from analysis import (
    MemberEvaluation,
    AnalysisResult,
    member_analysis_prompt,
    member_output_parser
)

# 승진 대상자 추천 (promotion.py)
from promotion import (
    PromotionCandidate,
    PromotionLLMResult,
    extract_top_candidates,
    recommend_grade,
    promotion_prompt,
    promotion_output_parser
)

# 평가 가이드 위반 (violation.py)
from violation import analyze_guide_violations, GuideViolation

# 환경 변수 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Fast API 사용
app = FastAPI()

# CORS 처리
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# LLM 모델 사용
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.1,
    api_key=OPENAI_API_KEY,
)

# 사원 분석 API 
@app.post("/api/analyze/member", response_model=AnalysisResult)
async def analyze_member(data: MemberEvaluation):

    items_text = "\n".join([
        f"- {i.item_name}: {i.score}점 (가중치 {i.weight}%) / 코멘트: {i.comment}"
        for i in data.form_items
    ])

    # 프롬프트 데이터 초기화
    prompt = member_analysis_prompt.format(
        template_name=data.template_name,
        employee_name=data.employee_name,
        employee_department=data.employee_department,
        employee_grade=data.employee_grade,
        total_score=data.total_score,
        total_rank=data.total_rank,
        items=items_text,
        format_instructions=member_output_parser.get_format_instructions()
    )

    response = llm.invoke(prompt)

    parsed: AnalysisResult = member_output_parser.parse(response.content)

    if not parsed.action_plan:
        parsed.action_plan = [
            "매주 개인 업무 목표를 명확히 설정하고 실행 결과를 점검한다",
            "업무 종료 후 개선 사항을 정리하여 다음 업무에 반영한다"
        ]

        print("⚠️ action_plan 누락 → 기본값 적용")

    return parsed

    


# 승진 대상자 추천 API
@app.post("/api/analyze/promotion", response_model=List[PromotionCandidate])
async def analyze_promotion(dashboard_data: List[dict]):

    # 사원(승진 후보자) 데이터 추출
    candidates = extract_top_candidates(dashboard_data)
    results: List[PromotionCandidate] = []

    # 후보자 데이터에서 필요한 데이터 정리
    for c in candidates:
        items_text = "\n".join([
            f"- {i['formItemName']}: {i['formItemScore']}점"
            for i in c["formItems"]
            if i["formItemScore"] is not None
        ])

        # 프롬프트 데이터 초기화
        prompt = promotion_prompt.format(
            name=c["name"],
            department=c["department"],
            grade=c["grade"],
            growth_rate=c["growth"],
            items=items_text,
            format_instructions=promotion_output_parser.get_format_instructions()
        )

        # LLM 모델로 승진 대상자 추천
        response = llm.invoke(prompt)
        parsed: PromotionLLMResult = promotion_output_parser.parse(response.content)

        # 응답 데이터 배열에 승진 대상자 추가
        results.append(
            PromotionCandidate(
                name=c["name"],
                department=c["department"],
                current_grade=c["grade"],
                recommended_grade=recommend_grade(c["grade"]),
                growth_rate=c["growth"],
                core_competencies=parsed.core_competencies,
                reason=parsed.reason
            )
        )

    return results

# 평가 가이드 위반 API
@app.post("/api/analyze/violation", response_model=List[GuideViolation])
async def analyze_guide_violation_api(payload: dict):

    guide_text = payload["guide"]
    template = payload["template"]   

    results = analyze_guide_violations(
        template=template,
        guide_text=guide_text,
        llm=llm
    )

    return results


# 헬스 체크 API
@app.get("/")
def health_check():
    return {"status": "ok"}

# main.py 실행
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )