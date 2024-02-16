# 할일

## 기능 수정사항

### 작업 전

- 스냅샷 계좌별 성격 구분 `EB_ASSET_GROUP` 테이블에 통화 필드 추가
  - 스냅샷 수정 시 환율 정보를 변경하면 외화 잔고가 원화로 변경되지 않는 문제가 있음

### 작업 완료


### 포기


## 버그 
### 해결 전 이슈

- 달력 작성에서 연속해서 2개 이상의 지출 항목을 입력 시 달력에 각각 지출 내용이 표시됨(지출 내용이 하나로 합해줘야됨)
- 모달창이 닫힐 때 랜덤하게 `.modal-backdrop` 영역이 남아 있어 화면 선택 및 클릭이 안됨.  
- 거래 등록 시 분류 자동완성 목록 10개 표시 제한 

### 해결 된 이슈

- 거래 입력 후 계좌 잔고 동기화
- 자산 스냅샷 입력 폼 표 컬럼 정렬이 안됨

### 포기