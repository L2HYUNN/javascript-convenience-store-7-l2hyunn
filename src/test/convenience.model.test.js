import ConvenienceModel from '../convenience/convenience.model.js';

describe('ConvenienceModel', () => {
  let convenienceModel;

  const testProducts =
    'name,price,quantity,promotion\n콜라,1000,10,탄산2+1\n콜라,1000,10,null\n탄산수,1200,5,탄산2+1\n물,500,10,null';

  beforeEach(() => {
    convenienceModel = new ConvenienceModel(testProducts);
  });

  it('상품 목록 파일에 있는 내용을 불러와 상품 목록 객체로 저장할 수 있어야 한다', () => {
    const stocks = {
      콜라: {
        default: { price: 1000, quantitiy: 10 },
        promotion: { price: 1000, quantitiy: 10, promotion: '탄산2+1' },
      },
      탄산수: {
        default: { price: 1200, quantitiy: 0 },
        promotion: { price: 1200, quantitiy: 5, promotion: '탄산2+1' },
      },
      물: {
        default: { price: 500, quantitiy: 10 },
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
        expectedError: ConvenienceModel.ERROR_MESSAGE.CAN_NOT_BE_EMPTY,
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
        description: '존재하지 않는 상품을 입력한 경우 경우 에러를 발생시켜야한다',
        input: '[콜라-3], [에너지바-5]',
        expectedError: ConvenienceModel.ERROR_MESSAGE.PRODUCT_NOT_FOUND,
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
});
