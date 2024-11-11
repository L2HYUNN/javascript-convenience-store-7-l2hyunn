import StockModel from '../stock/stock.model.js';

describe('StockModel', () => {
  let stockModel;

  beforeEach(() => {
    stockModel = new StockModel();

    const testProducts =
      'name,price,quantity,promotion\n콜라,1000,10,탄산2+1\n콜라,1000,10,null\n탄산수,1200,5,탄산2+1\n물,500,10,null';

    stockModel.setStock(testProducts);
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

    const result = stockModel.getStock();

    expect(result).toEqual(stocks);
  });

  it('구매 품목에 따라 가지고 있는 재고를 업데이트 할 수 있어야 한다', () => {
    const parsedInput = [
      { name: '콜라', quantity: 3 },
      { name: '물', quantity: 5 },
      { name: '탄산수', quantity: 4 },
    ];

    const stocks = {
      콜라: {
        default: { price: 1000, quantity: 10 },
        promotion: { price: 1000, quantity: 7, promotion: '탄산2+1' },
      },
      탄산수: {
        default: { price: 1200, quantity: 0 },
        promotion: { price: 1200, quantity: 1, promotion: '탄산2+1' },
      },
      물: {
        default: { price: 500, quantity: 5 },
        promotion: null,
      },
    };

    stockModel.updateStock(parsedInput);

    const result = stockModel.getStock();

    expect(result).toEqual(stocks);
  });

  it('재고 객체를 products 파일에 적절한 양식으로 변경할 수 있어야 한다', () => {
    const products = [
      'name,price,quantity,promotion',
      '콜라,1000,10,탄산2+1',
      '콜라,1000,10,null',
      '탄산수,1200,5,탄산2+1',
      '물,500,10,null',
    ];

    const result = stockModel.convertStockToText();

    expect(result).toEqual(products);
  });
});
