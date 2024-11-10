import PromotionModel from '../promotion/promotion.model.js';
import StockModel from '../stock/stock.model.js';

describe('PromotionModel', () => {
  let promotionModel;
  let stockModel;

  beforeEach(() => {
    stockModel = new StockModel();

    const testProducts =
      'name,price,quantity,promotion\n콜라,1000,10,탄산2+1\n콜라,1000,10,null\n탄산수,1200,5,탄산2+1\n물,500,10,null';

    const testPromotions =
      'name,buy,get,start_date,end_date\n탄산2+1,2,1,2024-01-01,2024-12-31\nMD추천상품,1,1,2024-01-01,2024-12-31\n반짝할인,1,1,2024-11-01,2024-11-30';

    stockModel.setStock(testProducts);

    promotionModel = new PromotionModel(stockModel);
    promotionModel.setPromotion(testPromotions);
  });

  it('프로모션 목록 파일에 있는 내용을 불러와 프로모션 목록 객체로 저장할 수 있어야 한다', () => {
    const promotions = {
      '탄산2+1': { buy: 2, get: 1, startDate: '2024-01-01', endDate: '2024-12-31' },
      MD추천상품: { buy: 1, get: 1, startDate: '2024-01-01', endDate: '2024-12-31' },
      반짝할인: { buy: 1, get: 1, startDate: '2024-11-01', endDate: '2024-11-30' },
    };

    const result = promotionModel.getPromotions();

    expect(result).toEqual(promotions);
  });

  describe('프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우', () => {
    it('해당하는 상품의 상품명을 반환해야 한다', () => {
      const parsedInput = { name: '콜라', quantity: 2 };

      const result = promotionModel.getPromotableItem(parsedInput);

      expect(result).toEqual('콜라');
    });

    it('해당하는 상품들의 상품명을 배열로 반환해야 한다', () => {
      const parsedInputs = [{ name: '콜라', quantity: 2 }];

      const result = promotionModel.getPromotableItems(parsedInputs);

      expect(result).toEqual(['콜라']);
    });

    it('프로모션 재고 보다 많은 상품을 가져온 경우 null을 가진 배열을 반환해야 한다', () => {
      const parsedInputs = [{ name: '콜라', quantity: 11 }];

      const result = promotionModel.getPromotableItems(parsedInputs);

      expect(result).toEqual([null]);
    });
  });

  describe('프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우', () => {
    it('해당하는 상품의 상품명과 프로모션 혜택 없이 결제되는 수량을 반환해야 한다', () => {
      const parsedInput = { name: '콜라', quantity: 15 };

      const result = promotionModel.getNonPromotionalItem(parsedInput);

      expect(result).toEqual({ name: '콜라', quantity: 6 });
    });

    it('해당하는 상품의 상품명과 프로모션 혜택 없이 결제되는 수량을 포함한 객체를 배열의 형태로 반환해야 한다', () => {
      const parsedInput = [{ name: '콜라', quantity: 15 }];

      const result = promotionModel.getNonPromotionalItems(parsedInput);

      expect(result).toEqual([{ name: '콜라', quantity: 6 }]);
    });
  });
});
