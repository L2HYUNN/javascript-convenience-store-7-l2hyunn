import { getISODateString, parseMarkdownFileContents } from '../lib/utils.js';

class PromotionModel {
  #promotion = {};

  #stock;

  constructor(stock) {
    this.#stock = stock;
  }

  #fillPromotionDetail(promotion) {
    const [promotionName, promotionBuy, promotionGet, promotionStartDate, promotionEndDate] =
      promotion;

    this.#promotion[promotionName] = {
      buy: Number(promotionBuy),
      get: Number(promotionGet),
      startDate: promotionStartDate,
      endDate: promotionEndDate,
    };
  }

  #fillPromotion(parsedPromotions) {
    parsedPromotions.forEach((promotion) => {
      this.#fillPromotionDetail(promotion);
    });
  }

  setPromotion(promotions) {
    const parsedPromotions = parseMarkdownFileContents(promotions);

    this.#fillPromotion(parsedPromotions);
  }

  getPromotions() {
    return this.#promotion;
  }

  #getPromotionDetail(purchaseInfoName) {
    const promotionName = this.#stock.getStock()[purchaseInfoName].promotion?.promotion;

    return this.#promotion[promotionName];
  }

  #getPromotionStockQuantity(purchaseInfoName) {
    return this.#stock.getStock()[purchaseInfoName].promotion.quantity;
  }

  #hasPromotion(purchaseInfoName) {
    return Boolean(this.#stock.getStock()[purchaseInfoName].promotion);
  }

  #isPromotableDate(purchaseInfoName) {
    const { startDate, endDate } = this.#getPromotionDetail(purchaseInfoName);
    const today = getISODateString();

    return new Date(startDate) <= new Date(today) && new Date(today) < new Date(endDate);
  }

  #isPromotableItem(purchaseInfoName, purchaseInfoQuantity) {
    const { buy: promotionBuy } = this.#getPromotionDetail(purchaseInfoName);

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
    const { buy: promotionBuy, get: promotionGet } = this.#getPromotionDetail(purchaseInfoName);

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
    const { buy: promotionBuy, get: promotionGet } = this.#getPromotionDetail(purchaseInfoName);

    return (
      this.#isPromotableDate(purchaseInfoName) &&
      this.#getPromotionStockQuantity(purchaseInfoName) >= promotionBuy + promotionGet
    );
  }

  #calculatePromotableInfo(purchaseInfoName, purchaseInfoQuantity) {
    const { buy: promotionBuy, get: promotionGet } = this.#getPromotionDetail(purchaseInfoName);

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

  getPromotion(parsedPurchaseInfo) {
    const { name, quantity } = parsedPurchaseInfo;

    if (this.#hasPromotion(name) && this.#isPromotableInfo(name, quantity)) {
      return this.#createPromotableInfo(name, quantity);
    }

    return null;
  }
}

export default PromotionModel;
