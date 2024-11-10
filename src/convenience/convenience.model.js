import { DateTimes } from '@woowacourse/mission-utils';
import { getISODateString } from '../lib/utils.js';

class ConvenienceModel {
  #stockInfo = {};

  #promotionInfo = {};

  static ERROR_MESSAGE = Object.freeze({
    CAN_NOT_BE_EMPTY: '[ERROR] 빈 값은 입력할 수 없어요',
    INVALID_INPUT: '[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.',
    INVALID_INPUT_FORMAT: '[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.',
    PRODUCT_NOT_FOUND: '[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.',
    STOCK_LIMIT_EXCEEDED: '[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.',
  });

  static STOCK = {
    DEFAULT: { default: { price: 0, quantity: 0 }, promotion: null },
  };

  static REGEX = {
    PURCHASE_INFO: /^\[[가-힣]+-\d+\]$/,
    PURCHASE_INFO_NAME_CAPTURE: /^\[([가-힣]+)-\d+\]$/,
    PURCHASE_INFO_QUANTITY_CAPTURE: /^\[[가-힣]+-(\d+)\]$/,
  };

  #parseMarkdownFileContents(fileContents) {
    return fileContents
      .trim()
      .split('\n')
      .slice(1)
      .map((fileContent) => fileContent.split(','));
  }

  #initializeStockInfo(parsedStocks) {
    parsedStocks.forEach((stock) => {
      const [stockName] = stock;

      this.#stockInfo[stockName] = {
        ...ConvenienceModel.STOCK.DEFAULT,
      };
    });
  }

  #fillDefaultStockInfoInPromotion(stock) {
    const [stockName, stockPrice, _, stockPromotion] = stock;

    if (stockPromotion === 'null') return;

    this.#stockInfo[stockName].default = {
      price: Number(stockPrice),
      quantity: 0,
    };
  }

  #fillPromotionStockInfoInPromotion(stock) {
    const [stockName, stockPrice, stockQuantity, stockPromotion] = stock;

    if (stockPromotion === 'null') return;

    this.#stockInfo[stockName].promotion = {
      price: Number(stockPrice),
      quantity: Number(stockQuantity),
      promotion: stockPromotion,
    };
  }

  #fillStockInfoInPromotion(stock) {
    this.#fillDefaultStockInfoInPromotion(stock);
    this.#fillPromotionStockInfoInPromotion(stock);
  }

  #fillStockInfoInDefault(stock) {
    const [stockName, stockPrice, stockQuantity, stockPromotion] = stock;

    if (stockPromotion !== 'null') return;

    this.#stockInfo[stockName].default.price = Number(stockPrice);
    this.#stockInfo[stockName].default.quantity = Number(stockQuantity);
  }

  #fillStockInfo(parsedStocks) {
    parsedStocks.forEach((stock) => {
      this.#fillStockInfoInPromotion(stock);
      this.#fillStockInfoInDefault(stock);
    });
  }

  setStockInfo(stocks) {
    const parsedStocks = this.#parseMarkdownFileContents(stocks);

    this.#initializeStockInfo(parsedStocks);
    this.#fillStockInfo(parsedStocks);
  }

  getStocks() {
    return this.#stockInfo;
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
    const parsedPromotions = this.#parseMarkdownFileContents(promotions);

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

  #hasPromotion(purchaseInfoName) {
    return Boolean(this.#stockInfo[purchaseInfoName].promotion);
  }

  getPromotableItem(parsedPurchaseInfo) {
    const { name, quantity } = parsedPurchaseInfo;

    if (this.#hasPromotion(name)) {
      const stockQuantity = this.#stockInfo[name].promotion.quantity;
      const promotionName = this.#stockInfo[name].promotion?.promotion;

      const { buy, startDate, endDate } = this.#promotionInfo[promotionName];

      const today = getISODateString();

      const isPromotable =
        new Date(startDate) <= new Date(today) &&
        new Date(today) < new Date(endDate) &&
        quantity % buy === 0 &&
        quantity < stockQuantity;

      if (isPromotable) {
        return name;
      }
    }

    return null;
  }

  getPromotableItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getPromotableItem(info));
  }

  getNonPromotionalItem(parsedPurchaseInfo) {
    const { name, quantity } = parsedPurchaseInfo;

    const hasPromotion = Boolean(this.#stockInfo[name].promotion);
    const promotionName = this.#stockInfo[name].promotion?.promotion;

    if (hasPromotion) {
      const promotions = this.getPromotions();
      const stockQuantity = this.#stockInfo[name].promotion.quantity;

      const { buy, get, startDate, endDate } = promotions[promotionName];

      const today = DateTimes.now().toISOString().split('T')[0];

      const isPromotable =
        new Date(startDate) <= new Date(today) &&
        new Date(today) < new Date(endDate) &&
        quantity >= stockQuantity;

      if (isPromotable) {
        const promotableItemCount = buy + get;
        const nonPromotionalItemInStockQuantity = stockQuantity % promotableItemCount;
        const nonPromotionalItemInQuantity = quantity - stockQuantity;

        return { name, quantity: nonPromotionalItemInStockQuantity + nonPromotionalItemInQuantity };
      }
    }

    return null;
  }

  getNonPromotionalItems(parsedPurchaseInfo) {
    return parsedPurchaseInfo.map((info) => this.getNonPromotionalItem(info));
  }

  getPromotionInfo(parsedPurchaseInfo) {
    const { name, quantity } = parsedPurchaseInfo;

    const hasPromotion = Boolean(this.#stockInfo[name].promotion);
    const promotionName = this.#stockInfo[name].promotion?.promotion;

    if (hasPromotion) {
      const promotions = this.getPromotions();
      const stockQuantity = this.#stockInfo[name].promotion.quantity;

      const { buy, get, startDate, endDate } = promotions[promotionName];

      const today = DateTimes.now().toISOString().split('T')[0];

      const isPromotable =
        new Date(startDate) <= new Date(today) &&
        new Date(today) < new Date(endDate) &&
        stockQuantity >= buy + get;

      const promotableStockCount = Math.trunc(stockQuantity / (buy + get));
      const promotableCount = Math.trunc(quantity / (buy + get));

      if (isPromotable) {
        if (promotableCount <= promotableStockCount) {
          return { name, quantity: promotableCount };
        }
        return { name, quantity: promotableStockCount };
      }
    }

    return null;
  }

  getReceipt(parsedPurchaseInfo, isMembershipDiscount) {
    const receipt = {
      purchaseInfo: [],
      promotionInfo: [],
      totalPurchasePrice: { quantity: 0, price: 0 },
      promotionDiscountPrice: 0,
      membershipDiscountPrice: 0,
      amountDue: 0,
    };

    parsedPurchaseInfo.forEach((info) => {
      receipt.purchaseInfo.push({
        name: info.name,
        quantity: info.quantity,
        price: info.quantity * this.#stockInfo[info.name].default.price,
      });

      receipt.totalPurchasePrice.quantity += info.quantity;
      receipt.totalPurchasePrice.price += info.quantity * this.#stockInfo[info.name].default.price;

      const promotableItem = this.getPromotionInfo(info);

      if (promotableItem) {
        receipt.promotionInfo.push(promotableItem);
      }
    });

    receipt.promotionInfo.forEach((info) => {
      receipt.promotionDiscountPrice += info.quantity * this.#stockInfo[info.name].default.price;
    });

    if (isMembershipDiscount === 'Y') {
      receipt.membershipDiscountPrice =
        (receipt.totalPurchasePrice.price - receipt.promotionDiscountPrice) * 0.3;
    }

    receipt.amountDue =
      receipt.totalPurchasePrice.price -
      receipt.promotionDiscountPrice -
      receipt.membershipDiscountPrice;

    return receipt;
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

    const stockNames = Object.keys(this.#stockInfo);

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
