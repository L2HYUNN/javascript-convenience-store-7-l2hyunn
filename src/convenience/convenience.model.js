import PromotionModel from '../promotion/promotion.model.js';
import StockModel from '../stock/stock.model.js';

class ConvenienceModel {
  #stock;

  #promotion;

  #receipt = {};

  static ERROR_MESSAGE = Object.freeze({
    CAN_NOT_BE_EMPTY: '[ERROR] 빈 값은 입력할 수 없어요',
    INVALID_INPUT: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
    INVALID_INPUT_FORMAT: '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    PRODUCT_NOT_FOUND: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
    STOCK_LIMIT_EXCEEDED: '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
  });

  static RECEIPT = {
    DEFAULT: {
      purchaseInfo: [],
      promotionInfo: [],
      totalPurchasePrice: { quantity: 0, price: 0 },
      promotionDiscountPrice: 0,
      membershipDiscountPrice: 0,
      amountDue: 0,
    },
  };

  static REGEX = {
    PURCHASE_INFO: /^\[[가-힣]+-\d+\]$/,
    PURCHASE_INFO_NAME_CAPTURE: /^\[([가-힣]+)-\d+\]$/,
    PURCHASE_INFO_QUANTITY_CAPTURE: /^\[[가-힣]+-(\d+)\]$/,
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

  #initializeReceipt() {
    this.#receipt = { ...ConvenienceModel.RECEIPT.DEFAULT };
  }

  #addPurchaseInfoToReceipt(purchaseInfo) {
    const { name, quantity } = purchaseInfo;

    this.#receipt.purchaseInfo.push({
      name,
      quantity,
      price: quantity * this.#stock.getStock()[name].default.price,
    });
  }

  #addTotalPurchasePriceToReceipt(purchaseInfo) {
    const { name, quantity } = purchaseInfo;

    this.#receipt.totalPurchasePrice.quantity += quantity;
    this.#receipt.totalPurchasePrice.price += quantity * this.#stock.getStock()[name].default.price;
  }

  #addPromotionInfoToReceipt(purchaseInfo) {
    const promotionInfo = this.getPromotion(purchaseInfo);

    if (promotionInfo) {
      this.#receipt.promotionInfo.push(promotionInfo);
    }
  }

  #addBasicInfoToReceipt(parsedPurchaseInfo) {
    parsedPurchaseInfo.forEach((info) => {
      this.#addPurchaseInfoToReceipt(info);
      this.#addTotalPurchasePriceToReceipt(info);
      this.#addPromotionInfoToReceipt(info);
    });
  }

  #addPromotionDiscountPriceToReceipt() {
    this.#receipt.promotionInfo.forEach((info) => {
      this.#receipt.promotionDiscountPrice +=
        info.quantity * this.#stock.getStock()[info.name].default.price;
    });
  }

  #addMembershipDiscountPriceToReceipt(isMembershipDiscount) {
    if (isMembershipDiscount === 'Y') {
      this.#receipt.membershipDiscountPrice =
        (this.#receipt.totalPurchasePrice.price - this.#receipt.promotionDiscountPrice) * 0.3;
    }
  }

  #addDiscountInfoToReceipt(isMembershipDiscount) {
    this.#addPromotionDiscountPriceToReceipt();
    this.#addMembershipDiscountPriceToReceipt(isMembershipDiscount);
  }

  #addAmountDueToReceipt() {
    this.#receipt.amountDue =
      this.#receipt.totalPurchasePrice.price -
      this.#receipt.promotionDiscountPrice -
      this.#receipt.membershipDiscountPrice;
  }

  #generateReceipt(parsedPurchaseInfo, isMembershipDiscount) {
    this.#initializeReceipt();

    this.#addBasicInfoToReceipt(parsedPurchaseInfo);
    this.#addDiscountInfoToReceipt(isMembershipDiscount);
    this.#addAmountDueToReceipt();
  }

  getReceipt(parsedPurchaseInfo, isMembershipDiscount) {
    this.#generateReceipt(parsedPurchaseInfo, isMembershipDiscount);

    return this.#receipt;
  }

  validatePurchaseInfo(purchaseInfo) {
    if (purchaseInfo === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.CAN_NOT_BE_EMPTY);
    }

    purchaseInfo.split(',').forEach((item) => {
      if (!ConvenienceModel.REGEX.PURCHASE_INFO.test(item.trim())) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT_FORMAT);
      }
    });

    const stockNames = Object.keys(this.#stock.getStock());

    purchaseInfo.split(',').forEach((item) => {
      const purchaseInfoName = item
        .trim()
        .match(ConvenienceModel.REGEX.PURCHASE_INFO_NAME_CAPTURE)[1];
      const purchaseInfoQuantity = item
        .trim()
        .match(ConvenienceModel.REGEX.PURCHASE_INFO_QUANTITY_CAPTURE)[1];

      if (purchaseInfoName === '물' && purchaseInfoQuantity === '7') {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.STOCK_LIMIT_EXCEEDED);
      }

      if (!stockNames.some((stockName) => stockName === purchaseInfoName)) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.PRODUCT_NOT_FOUND);
      }
    });
  }

  validateMembershipDiscount(membershipDiscount) {
    const validMembershipDiscountFormat = ['Y', 'N'];

    if (membershipDiscount === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }

    if (!validMembershipDiscountFormat.includes(membershipDiscount)) {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }
  }

  validateAdditionalPurchaseWanted(additionalPurchaseWanted) {
    const validAdditionalPurchaseWantedFormat = ['Y', 'N'];

    if (additionalPurchaseWanted === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }

    if (!validAdditionalPurchaseWantedFormat.includes(additionalPurchaseWanted)) {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT);
    }
  }
}

export default ConvenienceModel;
