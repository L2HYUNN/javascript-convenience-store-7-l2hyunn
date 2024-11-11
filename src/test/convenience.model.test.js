import ConvenienceModel from '../convenience/convenience.model.js';

describe('ConvenienceModel', () => {
  let convenienceModel;

  const testProducts =
    'name,price,quantity,promotion\n콜라,1000,10,탄산2+1\n콜라,1000,10,null\n탄산수,1200,5,탄산2+1\n물,500,10,null';

  const testPromotions =
    'name,buy,get,start_date,end_date\n탄산2+1,2,1,2024-01-01,2024-12-31\nMD추천상품,1,1,2024-01-01,2024-12-31\n반짝할인,1,1,2024-11-01,2024-11-30';

  beforeEach(() => {
    convenienceModel = new ConvenienceModel();
    convenienceModel.setStock(testProducts);
    convenienceModel.setPromotion(testPromotions);
  });

  it('상품 목록 파일에 있는 내용을 불러와 상품 목록 객체로 저장할 수 있어야 한다', () => {
    const stocks = {
      콜라: {
        default: { price: 1000, quantity: 10 },
        promotion: { price: 1000, quantity: 10, promotion: '탄산2+1' },
      },
      탄산수: {
        default: { price: 1200, quantity: 0 },
        promotion: { price: 1200, quantity: 5, promotion: '탄산2+1' },
      },
      물: {
        default: { price: 500, quantity: 10 },
        promotion: null,
      },
    };

    const result = convenienceModel.getStocks();

    expect(result).toEqual(stocks);
  });

  describe('유효한 상품명과 수량이 입력되지 않는 경우 에러를 발생시켜야한다', () => {
    it.each([
      {
        description: '빈 값이 입력된 경우 에러를 발생시켜야한다',
        input: '',
        expectedError: ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT,
      },
      {
        description: '구매할 상품과 수량 형식이 올바르지 않은 경우 에러를 발생시켜야한다',
        input: '[콜라+3], [물+5]',
        expectedError: ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT_FORMAT,
      },
      {
        description: '구매할 상품과 수량 형식이 올바르지 않은 경우 에러를 발생시켜야한다',
        input: '[woowa-3], [Course-5]',
        expectedError: ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT_FORMAT,
      },
      {
        description: '존재하지 않는 상품을 입력한 경우 에러를 발생시켜야한다',
        input: '[콜라-3], [에너지바-5]',
        expectedError: ConvenienceModel.ERROR_MESSAGE.PRODUCT_NOT_FOUND,
      },
      {
        description: '구매 수량이 재고 수량을 초고한 경우 에러를 발생시켜야한다',
        input: '[콜라-3], [물-11]',
        expectedError: ConvenienceModel.ERROR_MESSAGE.STOCK_LIMIT_EXCEEDED,
      },
    ])('$description', ({ input, expectedError }) => {
      expect(() => convenienceModel.validatePurchaseInfo(input)).toThrow(expectedError);
    });
  });

  describe('유효한 멤버십 할인 여부가 입력되지 않은 경우 에러를 발생시켜야한다', () => {
    it.each([
      {
        description: '빈 값이 입력된 경우 에러를 발생시켜야한다',
        input: '',
        expectedError: ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT,
      },
      {
        description: '유효하지 않은 형식이 입력된 경우 에러를 발생시켜야한다',
        input: 'Yes',
        expectedError: ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT,
      },
    ])('$description', ({ input, expectedError }) => {
      expect(() => convenienceModel.validateMembershipDiscount(input)).toThrow(expectedError);
    });
  });

  describe('유효한 재구매 여부가 입력되지 않은 경우 에러를 발생시켜야한다', () => {
    it.each([
      {
        description: '빈 값이 입력된 경우 에러를 발생시켜야한다',
        input: '',
        expectedError: ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT,
      },
      {
        description: '유효하지 않은 형식이 입력된 경우 에러를 발생시켜야한다',
        input: 'Yes',
        expectedError: ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT,
      },
    ])('$description', ({ input, expectedError }) => {
      expect(() => convenienceModel.validateAdditionalPurchaseWanted(input)).toThrow(expectedError);
    });
  });

  it('프로모션 목록 파일에 있는 내용을 불러와 프로모션 목록 객체로 저장할 수 있어야 한다', () => {
    const promotions = {
      '탄산2+1': { buy: 2, get: 1, startDate: '2024-01-01', endDate: '2024-12-31' },
      MD추천상품: { buy: 1, get: 1, startDate: '2024-01-01', endDate: '2024-12-31' },
      반짝할인: { buy: 1, get: 1, startDate: '2024-11-01', endDate: '2024-11-30' },
    };

    const result = convenienceModel.getPromotions();

    expect(result).toEqual(promotions);
  });

  it('입력받은 상품에 대한 정보를 상품명과 수량을 가진 객체의 배열로 반환할 수 있어야 한다', () => {
    const input = '[콜라-3], [물-5]';

    const parsedInput = [
      { name: '콜라', quantity: 3 },
      { name: '물', quantity: 5 },
    ];

    const result = convenienceModel.parsePurchaseInfo(input);

    expect(result).toEqual(parsedInput);
  });

  describe('프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우', () => {
    it('해당하는 상품의 상품명을 반환해야 한다', () => {
      const parsedInput = { name: '콜라', quantity: 2 };

      const result = convenienceModel.getPromotableItem(parsedInput);

      expect(result).toEqual('콜라');
    });

    it('해당하는 상품들의 상품명을 배열로 반환해야 한다', () => {
      const parsedInputs = [{ name: '콜라', quantity: 2 }];

      const result = convenienceModel.getPromotableItems(parsedInputs);

      expect(result).toEqual(['콜라']);
    });

    it('프로모션 재고 보다 많은 상품을 가져온 경우 null을 가진 배열을 반환해야 한다', () => {
      const parsedInputs = [{ name: '콜라', quantity: 11 }];

      const result = convenienceModel.getPromotableItems(parsedInputs);

      expect(result).toEqual([null]);
    });
  });

  describe('프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우', () => {
    it('해당하는 상품의 상품명과 프로모션 혜택 없이 결제되는 수량을 반환해야 한다', () => {
      const parsedInput = { name: '콜라', quantity: 15 };

      const result = convenienceModel.getNonPromotionalItem(parsedInput);

      expect(result).toEqual({ name: '콜라', quantity: 6 });
    });

    it('해당하는 상품의 상품명과 프로모션 혜택 없이 결제되는 수량을 포함한 객체를 배열의 형태로 반환해야 한다', () => {
      const parsedInput = [{ name: '콜라', quantity: 15 }];

      const result = convenienceModel.getNonPromotionalItems(parsedInput);

      expect(result).toEqual([{ name: '콜라', quantity: 6 }]);
    });
  });

  it('구매할 상품명, 수량, 프로모션 여부, 멤버십 할인 여부를 입력받아 영수증 객체를 반환해야 한다', () => {
    const parsedInput = [
      { name: '콜라', quantity: 3 },
      { name: '물', quantity: 5 },
    ];

    const isMembershipDiscount = 'Y';

    const receipt = {
      purchaseInfo: [
        { name: '콜라', quantity: 3, price: 3000 },
        { name: '물', quantity: 5, price: 2500 },
      ],
      promotionInfo: [{ name: '콜라', quantity: 1 }],
      totalPurchasePrice: { quantity: 8, price: 5500 },
      promotionDiscountPrice: 1000,
      membershipDiscountPrice: 1350,
      amountDue: 3150,
    };

    const result = convenienceModel.getReceipt(parsedInput, isMembershipDiscount);

    expect(result).toEqual(receipt);
  });
});
