import { filterNonNull } from '../lib/utils.js';
import { input, output } from '../lib/view.js';

class ConvenienceView {
  static QUERY = Object.freeze({
    GET_PRODUCT_INFO: '구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])',
    GET_IS_MEMBERSHIP_DISCOUNT: '멤버십 할인을 받으시겠습니까? (Y/N)',
    GET_IS_ADDITIONAL_PURCHASE_WANTED: '감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)',
    GET_SHOULD_ADD_ITEM_FOR_PROMOTION: (promotableItem) =>
      `현재 ${promotableItem}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)`,
    GET_SHOULD_ADD_ITEM_WITHOUT_PROMOTION: (name, quantity) =>
      `현재 ${name} ${quantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)`,
  });

  static MESSAGE = Object.freeze({
    WELCOME: '안녕하세요. W편의점입니다.',
    STOCKS_INFO: '현재 보유하고 있는 상품입니다.\n',
    PURCHASE_INFO: (info) =>
      `${info.name}		     ${info.quantity}         ${info.price.toLocaleString()}\n`,
    PROMOTION_INFO: (info) => `${info.name}		     ${info.quantity}\n`,
    RECEIPT: (purchaseInfoMessage, promotionInfoMessage, receipt) => `
==============W 편의점================
상품명             수량      금액   
${purchaseInfoMessage}
=============증     정===============
${promotionInfoMessage}
====================================
총구매액          ${receipt.totalPurchasePrice.quantity}        ${receipt.totalPurchasePrice.price.toLocaleString()}
행사할인                  -${receipt.promotionDiscountPrice.toLocaleString()}
멤버십할인                -${receipt.membershipDiscountPrice.toLocaleString()}
내실돈                     ${receipt.amountDue.toLocaleString()}
`,
  });

  static FILE_PATH = Object.freeze({
    PRODUCS: '../../public/products.md',
  });

  printLineBreak() {
    output('');
  }

  printErrorMessage(error) {
    output(error.message);
  }

  printWelcomeMessage() {
    output(ConvenienceView.MESSAGE.WELCOME);
  }

  printStocksInfo() {
    output(ConvenienceView.MESSAGE.STOCKS_INFO);
  }

  #createPromotionNonStockMessage(stocks, stockKey) {
    const { promotion } = stocks[stockKey];

    if (stocks[stockKey].promotion && promotion.quantity === 0) {
      return `- ${stockKey} ${promotion.price.toLocaleString()}원 재고 없음 ${promotion.promotion}`;
    }

    return null;
  }

  #createPromotionStockMessage(stocks, stockKey) {
    const { promotion } = stocks[stockKey];

    if (stocks[stockKey].promotion && promotion.quantity !== 0) {
      return `- ${stockKey} ${promotion.price.toLocaleString()}원 ${promotion.quantity}개 ${promotion.promotion}`;
    }

    return null;
  }

  #createDefaultNonStockMessage(stocks, stockKey) {
    const {
      default: { price: defaultPrice, quantity: defaultQuantity },
    } = stocks[stockKey];

    if (defaultQuantity === 0) {
      return `- ${stockKey} ${defaultPrice.toLocaleString()}원 재고 없음`;
    }

    return null;
  }

  #createDefaultStockMessage(stocks, stockKey) {
    const {
      default: { price: defaultPrice, quantity: defaultQuantity },
    } = stocks[stockKey];

    if (defaultQuantity !== 0) {
      return `- ${stockKey} ${defaultPrice.toLocaleString()}원 ${defaultQuantity}개`;
    }

    return null;
  }

  #createStockMessage(stocks) {
    return Object.keys(stocks).map((stockKey) => {
      const message = [
        this.#createPromotionNonStockMessage(stocks, stockKey),
        this.#createPromotionStockMessage(stocks, stockKey),
        this.#createDefaultNonStockMessage(stocks, stockKey),
        this.#createDefaultStockMessage(stocks, stockKey),
      ];

      return filterNonNull(message);
    });
  }

  printStocks(stocks) {
    output(this.#createStockMessage(stocks).flat().join('\n'));
    output('');
  }

  #createPurchaseInfoMessage(purchaseInfo) {
    return purchaseInfo.map((info) => ConvenienceView.MESSAGE.PURCHASE_INFO(info)).join('');
  }

  #createPromotionInfoMessage(promotionInfo) {
    return promotionInfo.map((info) => ConvenienceView.MESSAGE.PROMOTION_INFO(info)).join('');
  }

  createReceiptMessage(purchaseInfo, promotionInfo) {
    return {
      purchaseInfoMessage: this.#createPurchaseInfoMessage(purchaseInfo),
      promotionInfoMessage: this.#createPromotionInfoMessage(promotionInfo),
    };
  }

  printReceipt(receipt) {
    const { purchaseInfoMessage, promotionInfoMessage } = this.createReceiptMessage(
      receipt.purchaseInfo,
      receipt.promotionInfo,
    );

    output(ConvenienceView.MESSAGE.RECEIPT(purchaseInfoMessage, promotionInfoMessage, receipt));
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

  async getShouldAddItemForPromotion(promotableItem) {
    const result = await input(
      ConvenienceView.QUERY.GET_SHOULD_ADD_ITEM_FOR_PROMOTION(promotableItem),
    );

    return result;
  }

  async getShouldAddItemWithoutPromotion(name, quantity) {
    const result = await input(
      ConvenienceView.QUERY.GET_SHOULD_ADD_ITEM_WITHOUT_PROMOTION(name, quantity),
    );

    return result;
  }
}

export default ConvenienceView;
