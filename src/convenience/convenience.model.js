import { getISODateString, parseMarkdownFileContents } from '../lib/utils.js';
import StockModel from '../stock/stock.model.js';

class ConvenienceModel {
  #stock;

  #promotionInfo = {};

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

  #fillPromotionInfoDetail(promotion) {
    const [promotionName, promotionBuy, promotionGet, promotionStartDate, promotionEndDate] =
      promotion;

    this.#promotionInfo[promotionName] = {
      buy: Number(promotionBuy),
      get: Number(promotionGet),
      startDate: promotionStartDate,
      endDate: promotionEndDate,
    };
  }

  #fillPromotionInfo(parsedPromotions) {
    parsedPromotions.forEach((promotion) => {
      this.#fillPromotionInfoDetail(promotion);
    });
  }

  setPromotionInfo(promotions) {
    const parsedPromotions = parseMarkdownFileContents(promotions);

    this.#fillPromotionInfo(parsedPromotions);
  }

  getPromotions() {
    return this.#promotionInfo;
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

  #getPromotionInfoDetail(purchaseInfoName) {
    const promotionName = this.#stock.getStock()[purchaseInfoName].promotion?.promotion;

    return this.#promotionInfo[promotionName];
  }

  #getPromotionStockQuantity(purchaseInfoName) {
    return this.#stock.getStock()[purchaseInfoName].promotion.quantity;
  }

  #hasPromotion(purchaseInfoName) {
    return Boolean(this.#stock.getStock()[purchaseInfoName].promotion);
  }

  #isPromotableDate(purchaseInfoName) {
    const { startDate, endDate } = this.#getPromotionInfoDetail(purchaseInfoName);
    const today = getISODateString();

    return new Date(startDate) <= new Date(today) && new Date(today) < new Date(endDate);
  }

  #isPromotableItem(purchaseInfoName, purchaseInfoQuantity) {
    const { buy: promotionBuy } = this.#getPromotionInfoDetail(purchaseInfoName);

    return (
      purchaseInfoQuantity % promotionBuy === 0 &&
      purchaseInfoQuantity < this.#getPromotionStockQuantity(purchaseInfoName)
    );
  }

  #isPromotable(purchaseInfoName, purchaseInfoQuantity) {
    return (
      this.#isPromotableDate(purchaseInfoName) &&
      this.#isPromotableItem(purchaseInfoName, purchaseInfoQuantity)
    );
  }

  getPromotableItem(parsedPurchaseInfo) {
    const { name, quantity } = parsedPurchaseInfo;

    if (this.#hasPromotion(name) && this.#isPromotable(name, quantity)) {
      return name;
    }

    return null;
  }

  getPromotableItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getPromotableItem(info));
  }

  #isNotPromotableItem(purchaseInfoName, purchaseInfoQuantity) {
    return purchaseInfoQuantity >= this.#getPromotionStockQuantity(purchaseInfoName);
  }

  #isNotPromotable(purchaseInfoName, purchaseInfoQuantity) {
    return (
      this.#isPromotableDate(purchaseInfoName) &&
      this.#isNotPromotableItem(purchaseInfoName, purchaseInfoQuantity)
    );
  }

  #calculateNonPromotionalItemQuantity(purchaseInfoName, purchaseInfoQuantity) {
    const { buy: promotionBuy, get: promotionGet } = this.#getPromotionInfoDetail(purchaseInfoName);

    const nonPromotionalItemInStockQuantity =
      this.#getPromotionStockQuantity(purchaseInfoName) % (promotionBuy + promotionGet);
    const nonPromotionalItemInQuantity =
      purchaseInfoQuantity - this.#getPromotionStockQuantity(purchaseInfoName);

    return nonPromotionalItemInStockQuantity + nonPromotionalItemInQuantity;
  }

  #createNonPromotionalItem(purchaseInfoName, purchaseInfoQuantity) {
    return {
      name: purchaseInfoName,
      quantity: this.#calculateNonPromotionalItemQuantity(purchaseInfoName, purchaseInfoQuantity),
    };
  }

  getNonPromotionalItem(parsedPurchaseInfo) {
    const { name, quantity } = parsedPurchaseInfo;

    if (this.#hasPromotion(name) && this.#isNotPromotable(name, quantity)) {
      return this.#createNonPromotionalItem(name, quantity);
    }

    return null;
  }

  getNonPromotionalItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getNonPromotionalItem(info));
  }

  #isPromotableInfo(purchaseInfoName) {
    const { buy: promotionBuy, get: promotionGet } = this.#getPromotionInfoDetail(purchaseInfoName);

    return (
      this.#isPromotableDate(purchaseInfoName) &&
      this.#getPromotionStockQuantity(purchaseInfoName) >= promotionBuy + promotionGet
    );
  }

  #calculatePromotableInfo(purchaseInfoName, purchaseInfoQuantity) {
    const { buy: promotionBuy, get: promotionGet } = this.#getPromotionInfoDetail(purchaseInfoName);

    const promotableStockCount = Math.trunc(
      this.#getPromotionStockQuantity(purchaseInfoName) / (promotionBuy + promotionGet),
    );
    const promotableCount = Math.trunc(purchaseInfoQuantity / (promotionBuy + promotionGet));

    return { promotableCount, promotableStockCount };
  }

  #createPromotableInfo(purchaseInfoName, purchaseInfoQuantity) {
    const { promotableCount, promotableStockCount } = this.#calculatePromotableInfo(
      purchaseInfoName,
      purchaseInfoQuantity,
    );

    if (promotableCount <= promotableStockCount) {
      return { name: purchaseInfoName, quantity: promotableCount };
    }

    return { name: purchaseInfoName, quantity: promotableStockCount };
  }

  getPromotionInfo(parsedPurchaseInfo) {
    const { name, quantity } = parsedPurchaseInfo;

    if (this.#hasPromotion(name) && this.#isPromotableInfo(name, quantity)) {
      return this.#createPromotableInfo(name, quantity);
    }

    return null;
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
    const promotionInfo = this.getPromotionInfo(purchaseInfo);

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
