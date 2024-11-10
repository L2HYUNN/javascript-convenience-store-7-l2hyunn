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
});
