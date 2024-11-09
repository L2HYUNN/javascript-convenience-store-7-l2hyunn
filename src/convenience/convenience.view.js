import { input, output } from '../lib/view.js';

class ConvenienceView {
  static QUERY = Object.freeze({
    GET_PRODUCT_INFO: '구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])',
    GET_IS_MEMBERSHIP_DISCOUNT: '멤버십 할인을 받으시겠습니까? (Y/N)',
    GET_IS_ADDITIONAL_PURCHASE_WANTED: '감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)',
  });

  static MESSAGE = Object.freeze({
    WELCOME: '안녕하세요. W편의점입니다.',
    STOCKS_INFO: '현재 보유하고 있는 상품입니다.\n',
  });

  static FILE_PATH = Object.freeze({
    PRODUCS: '../../public/products.md',
  });

  printWelcomeMessage() {
    output(ConvenienceView.MESSAGE.WELCOME);
  }

  printStocksInfo() {
    output(ConvenienceView.MESSAGE.STOCKS_INFO);
  }

  printStocks(stocks) {
    const result = Object.keys(stocks).map((stockKey) => {
      const {
        default: { price: defaultPrice, quantitiy: defaultQuantitiy },
        promotion,
      } = stocks[stockKey];
      const message = [];

      if (stocks[stockKey].promotion) {
        if (promotion.quantitiy === 0) {
          message.push(
            `- ${stockKey} ${promotion.price.toLocaleString()}원 재고 없음 ${promotion.promotion}`,
          );
        }

        if (promotion.quantitiy !== 0) {
          message.push(
            `- ${stockKey} ${promotion.price.toLocaleString()}원 ${promotion.quantitiy}개 ${promotion.promotion}`,
          );
        }
      }

      if (defaultQuantitiy === 0) {
        message.push(`- ${stockKey} ${defaultPrice.toLocaleString()}원 재고 없음`);
      }

      if (defaultQuantitiy !== 0) {
        message.push(`- ${stockKey} ${defaultPrice.toLocaleString()}원 ${defaultQuantitiy}개`);
      }

      return message;
    });

    output(result.flat().join('\n'));
  }

  async getPurcharseInfo() {
    const result = await input(ConvenienceView.QUERY.GET_PRODUCT_INFO);

    return result.trim();
  }

  async getIsMembershipDiscount() {
    const result = await input(ConvenienceView.QUERY.GET_IS_MEMBERSHIP_DISCOUNT);

    return result.trim();
  }

  async getIsAdditionalPurchaseWanted() {
    const result = await input(ConvenienceView.QUERY.GET_IS_ADDITIONAL_PURCHASE_WANTED);

    return result.trim();
  }
}

export default ConvenienceView;