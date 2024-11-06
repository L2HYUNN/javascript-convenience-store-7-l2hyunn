import { output } from '../lib/view.js';

class ConvenienceView {
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
}

export default ConvenienceView;
