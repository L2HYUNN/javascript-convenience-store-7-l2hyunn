import PromotionModel from '../promotion/promotion.model.js';
import ReceiptModel from '../receipt/receipt.model.js';
import StockModel from '../stock/stock.model.js';

class ConvenienceModel {
  #stock;

  #promotion;

  #receipt;

  static ERROR_MESSAGE = Object.freeze({
    CAN_NOT_BE_EMPTY: '[ERROR] 빈 값은 입력할 수 없어요',
    INVALID_INPUT: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
    INVALID_INPUT_FORMAT: '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    PRODUCT_NOT_FOUND: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
    STOCK_LIMIT_EXCEEDED: '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
  });

  static REGEX = {
    PURCHASE_INFO: /^\[[가-힣]+-\d+\]$/,
    PURCHASE_INFO_NAME_CAPTURE: /^\[([가-힣]+)-\d+\]$/,
    PURCHASE_INFO_QUANTITY_CAPTURE: /^\[[가-힣]+-(\d+)\]$/,
  };

  static FORMAT = {
    ANSWER: ['Y', 'N'],
  };

  constructor() {
    this.#stock = new StockModel();
  }

  setStock(stocks) {
    this.#stock.setStock(stocks);
  }

  getStocks() {
    return this.#stock.getStock();
  }

  setPromotion(promotions) {
    this.#promotion = new PromotionModel(this.#stock);
    this.#promotion.setPromotion(promotions);
  }

  getPromotions() {
    return this.#promotion.getPromotions();
  }

  #findPurchaseInfoName(info) {
    return info.trim().match(ConvenienceModel.REGEX.PURCHASE_INFO_NAME_CAPTURE)[1];
  }

  #findPurchaseInfoQuantity(info) {
    return info.trim().match(ConvenienceModel.REGEX.PURCHASE_INFO_QUANTITY_CAPTURE)[1];
  }

  parsePurchaseInfo(purchaseInfo) {
    return purchaseInfo.split(',').map((info) => ({
      name: this.#findPurchaseInfoName(info),
      quantity: Number(this.#findPurchaseInfoQuantity(info)),
    }));
  }

  getPromotableItem(parsedPurchaseInfo) {
    return this.#promotion.getPromotableItem(parsedPurchaseInfo);
  }

  getPromotableItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getPromotableItem(info));
  }

  getNonPromotionalItem(parsedPurchaseInfo) {
    return this.#promotion.getNonPromotionalItem(parsedPurchaseInfo);
  }

  getNonPromotionalItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getNonPromotionalItem(info));
  }

  getPromotion(parsedPurchaseInfo) {
    return this.#promotion.getPromotion(parsedPurchaseInfo);
  }

  getReceipt(parsedPurchaseInfo, isMembershipDiscount) {
    this.#receipt = new ReceiptModel(this.#stock, this.#promotion);

    return this.#receipt.getReceipt(parsedPurchaseInfo, isMembershipDiscount);
  }

  updateStock(parsedPurchaseInfo) {
    this.#stock.updateStock(parsedPurchaseInfo);
  }

  convertStockToText() {
    return this.#stock.convertStockToText();
  }

  #validateIsEmpty(value) {
    if (value === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }
  }

  #validateIsAnswerFormat(value) {
    if (!ConvenienceModel.FORMAT.ANSWER.includes(value)) {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }
  }

  validateYesNoAnswer(value) {
    this.#validateIsEmpty(value);
    this.#validateIsAnswerFormat(value);
  }

  #validateInvalidInputFormat(purchaseInfo) {
    purchaseInfo.split(',').forEach((item) => {
      if (!ConvenienceModel.REGEX.PURCHASE_INFO.test(item.trim())) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT_FORMAT);
      }
    });
  }

  #validateIsProductNotFound(purchaseInfo) {
    const stockNames = Object.keys(this.#stock.getStock());

    purchaseInfo.split(',').forEach((item) => {
      const purchaseInfoName = this.#findPurchaseInfoName(item);

      if (!stockNames.some((stockName) => stockName === purchaseInfoName)) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.PRODUCT_NOT_FOUND);
      }
    });
  }

  #calculateTotalStock(info) {
    const stock = this.#stock.getStock();
    const purchaseInfoName = this.#findPurchaseInfoName(info);

    const defaultStockQuantity = stock[purchaseInfoName].default.quantity;
    const promotionStockQuantity = stock[purchaseInfoName].promotion?.quantity || 0;

    return defaultStockQuantity + promotionStockQuantity;
  }

  #validateIsStockLimitExceeded(purchaseInfo) {
    purchaseInfo.split(',').forEach((info) => {
      const purchaseInfoQuantity = this.#findPurchaseInfoQuantity(info);
      const totalStock = this.#calculateTotalStock(info);

      if (Number(purchaseInfoQuantity) > totalStock) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.STOCK_LIMIT_EXCEEDED);
      }
    });
  }

  #validateIsPositiveInteger(purchaseInfo) {
    purchaseInfo.split(',').forEach((info) => {
      const purchaseInfoQuantity = this.#findPurchaseInfoQuantity(info);

      if (!Number.isInteger(Number(purchaseInfoQuantity)) || Number(purchaseInfoQuantity) <= 0) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
      }
    });
  }

  validatePurchaseInfo(purchaseInfo) {
    this.#validateIsEmpty(purchaseInfo);
    this.#validateInvalidInputFormat(purchaseInfo);
    this.#validateIsPositiveInteger(purchaseInfo);
    this.#validateIsProductNotFound(purchaseInfo);
    this.#validateIsStockLimitExceeded(purchaseInfo);
  }
}

export default ConvenienceModel;
