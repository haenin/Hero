# File Name: analysis.py
# Description: 사원 평가 분석 로직
#
# history: 
# 2025/12/27 - 승민 최초 작성
#
# @author: 승민

from typing import List
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# 평가서 항목 타입
class FormItem(BaseModel):
    item_name: str
    score: float
    weight: float
    comment: str

# 사원 평가 타입
class MemberEvaluation(BaseModel):
    template_name: str
    employee_name: str
    employee_department: str
    employee_grade: str
    total_score: float
    total_rank: str
    form_items: List[FormItem]


# 사원 분석 결과 타입
class AnalysisResult(BaseModel):
    strengths: List[str]
    improvements: List[str]
    action_plan: List[str]


# AI의 출력을 Pydantic 모델(BaseModel)에 맞게 구조화된 데이터로 변환
member_output_parser = PydanticOutputParser(
    pydantic_object=AnalysisResult
)


# LLM에 보낼 프롬프트 설계
member_analysis_prompt = ChatPromptTemplate.from_template("""
너는 기업 인사팀에서 사용하는 평가 분석 AI야.

아래 사원 평가 데이터를 기반으로 분석해.

{format_instructions}

출력 규칙 (매우 중요):
- 반드시 strengths, improvements, action_plan 3개 필드를 모두 포함할 것
- action_plan은 절대 생략하지 말 것
- action_plan은 최소 2개 이상
- 실행 가능한 행동 단위로 작성

[평가 템플릿]
{template_name}

[사원 정보]
이름: {employee_name}
부서: {employee_department}
직급: {employee_grade}

[최종 점수]
{total_score}

[최종 등급]
{total_rank}

[세부 평가 항목]
{items}

출력 예시(JSON 형식):
{{
  "strengths": [
    "업무 수행 안정성이 높고 일정 관리가 우수함"
  ],
  "improvements": [
    "문제 해결 과정에서 주도적인 접근이 필요함"
  ],
  "action_plan": [
    "매주 개인 업무 목표를 명확히 설정하고 실행 결과를 점검한다",
    "분기별 역량 개선 계획을 수립하고 팀장 피드백을 받는다"
  ]
}}

조건:
- 반드시 JSON 형식
- 한국어
- 실무 인사평가 스타일
""")