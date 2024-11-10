# javascript-convenience-store-precourse

## 구현 기능 목록

사용자가 입력한 상품의 가격과 수량을 기반으로 최종 결제 금액을 계산한다.

### 입출력

- [x] 사용자에게 Welcome 문구를 안내하고, 현재 보유하고 있는 상품 리스트를 보여준다.
- [x] 구매할 상품명과 수량을 입력받는다.
- [ ] 입력받은 구매할 상품명과 수량이 유효하지 않은 경우 "[ERROR]"로 시작하는 오류 메시지와 함께 상황에 맞는 안내를 출력한 후 다시 입력받을 수 있게 한다.

  - [x] 구매할 상품과 수량 형식이 올바르지 않은 경우: `[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.`
  - [x] 존재하지 않는 상품을 입력한 경우: `[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.`
  - [ ] 구매 수량이 재고 수량을 초과한 경우: `[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.`
  - [ ] 빈 값을 입력한 경우: `[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.`

- [x] 멤버십 할인 여부를 입력받는다.

  - [x] 빈 값을 입력한 경우: `[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.`
  - [x] 유효하지 않은 형식을 입력한 경우: `[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.`

- [x] 구매하고 싶은 다른 상품이 있는지의 여부를 입력받는다.

  - [x] 빈 값을 입력한 경우: `[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.`

### 계산

- [x] 입력받은 상품명, 수량, 프로모션 할인, 멤버십 할인 정보를 토대로 최종 결제 금액을 계산한다.

  - [x] 입력받은 상품명과 수량을 토대로 프로모션 할인 안내 여부를 계산한다.

    - [x] 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우, 필요한 수량을 추가로 가져오면 혜택을 받을 수 있음을 안내한다.

      - [x] Y를 입력 받는 경우 증정 받을 수 있는 상품을 추가한다.
      - [x] N을 입력 받는 경우 증정 받을 수 있는 상품을 추가하지 않는다.

    - [x] 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우, 일부 수량에 대해 정가로 결제하게 됨을 안내한다.

      - [x] Y를 입력 받는 경우 일부 수량에 대해 정가로 결제한다.
      - [x] N을 입력 받는 경우 정가로 결제해야하는 수량만큼 제외한 후 결제를 진행한다.

  - [x] 입력받은 멤버실 할인 적용 여부를 토대로 최종 결제 금액을 계산한다.

    - [x] Y를 입력 받는 경우 멤버십 할인을 적용하여 결제한다.
    - [x] N을 입력 받는 경우 멤버십 할인을 적용하지 않은 금액을 결제한다.

- [x] 총구매액은 상품별 가격과 수량을 곱하여 계산하며, 프로모션 및 멤버십 할인 정책을 반영하여 최종 결제 금액을 산출한다.
- [x] 구매 내역과 산출한 금액 정보를 영수증으로 출력한다.
- [ ] 영수증 출력 후 추가 구매를 진행할지 또는 종료할지를 선택할 수 있다.
- [ ] 사용자가 잘못된 값을 입력할 경우 "[ERROR]"로 시작하는 메시지와 함께 Error를 발생시키고 해당 메시지를 출력한 다음 해당 지점부터 다시 입력을 받는다.

---

### 재고 관리

- [ ] 각 상품의 재고 수량을 고려하여 결제 가능 여부를 확인한다.
- [ ] 고객이 상품을 구매할 때마다, 결제된 수량만큼 해당 상품의 재고에서 차감하여 수량을 관리한다.
- [ ] 재고를 차감함으로써 시스템은 최신 재고 상태를 유지하며, 다음 고객이 구매할 때 정확한 재고 정보를 제공한다.

### 프로모션 할인

- [ ] 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우, 필요한 수량을 추가로 가져오면 혜택을 받을 수 있음을 안내한다.
- [ ] 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우, 일부 수량에 대해 정가로 결제하게 됨을 안내한다.

> **규칙**
>
> 오늘 날짜가 프로모션 기간 내에 포함된 경우에만 할인을 적용한다.
>
> 프로모션은 N개 구매 시 1개 무료 증정(Buy N Get 1 Free)의 형태로 진행된다.
>
> 1+1 또는 2+1 프로모션이 각각 지정된 상품에 적용되며, 동일 상품에 여러 프로모션이 적용되지 않는다.
>
> 프로모션 혜택은 프로모션 재고 내에서만 적용할 수 있다.
>
> 프로모션 기간 중이라면 프로모션 재고를 우선적으로 차감하며, 프로모션 재고가 부족할 경우에는 일반 재고를 사용한다.

### 멤버십 할인

- [ ] 멤버십 회원은 프로모션 적용 후 남은 금액에 대해 할인을 적용한다.

> **규칙**
>
> 멤버십 회원은 프로모션 미적용 금액의 30%를 할인받는다.
>
> 프로모션 적용 후 남은 금액에 대해 멤버십 할인을 적용한다.
>
> 멤버십 할인의 최대 한도는 8,000원이다.

### 영수증 출력

- [ ] 영수증은 고객의 구매 내역과 할인을 요약하여 출력한다.

> **규칙**
>
> 영수증 항목은 아래와 같다.
>
> - 구매 상품 내역: 구매한 상품명, 수량, 가격
> - 증정 상품 내역: 프로모션에 따라 무료로 제공된 증정 상품의 목록
>   - 금액 정보
>   - 총구매액: 구매한 상품의 총 수량과 총 금액
>   - 행사할인: 프로모션에 의해 할인된 금액
>   - 멤버십할인: 멤버십에 의해 추가로 할인된 금액
>   - 내실돈: 최종 결제 금액
> - 영수증의 구성 요소를 보기 좋게 정렬하여 고객이 쉽게 금액과 수량을 확인할 수 있게 한다.

## 구현 전 설계

모든 서비스는 **편의점**에 의해 이루어진다.

MVC 패턴을 사용하고 비지니스 로직 분리를 위해 `Service`를 추가로 사용한다.

### Object

- Convenience: 전체적인 편의점 서비스를 담당
  - 결제
  - 재고 관리
  - 영수증 출력
- Policy: 프로모션 할인, 멤버십 할인에 대한 정책을 담당
  - 프로모션 할인
  - 멤버십 할인
