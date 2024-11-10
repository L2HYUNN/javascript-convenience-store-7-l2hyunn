import { DateTimes } from '@woowacourse/mission-utils';

class ConvenienceModel {
  #stockInfo = {};

  #promotions;

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

  constructor(_, promotions) {
    this.#promotions = promotions;
  }

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

  #parsePromotions(promotions) {
    const promotionInfo = {};

    const parsedPromotions = this.#parseMarkdownFileContents(promotions);

    parsedPromotions.forEach((promotion) => {
      const [name, buy, get, startDate, endDate] = promotion;

      promotionInfo[name] = { buy: Number(buy), get: Number(get), startDate, endDate };
    });

    return promotionInfo;
  }

  getPromotions() {
    return this.#parsePromotions(this.#promotions);
  }

  // #parsePurchaseInfo(purchaseInfo) {
  //   const regex = /^[가-힣]+-[1-9]\d*$/;

  //   return purchaseInfo.split(',');
  // }

  parsePurchaseInfo(purchaseInfo) {
    const purchaseInfoNameCaptureRegex = /^\[([가-힣]+)-\d+\]$/;
    const purchaseInfoQuantityCaptureRegex = /^\[[가-힣]+-(\d+)\]$/;

    return purchaseInfo.split(',').map((item) => {
      const purchaseInfoName = item.trim().match(purchaseInfoNameCaptureRegex)[1];
      const purchaseInfoQuantity = item.trim().match(purchaseInfoQuantityCaptureRegex)[1];

      return { name: purchaseInfoName, quantity: Number(purchaseInfoQuantity) };
    });
  }

  getPromotableItem(parsedPurchaseInfo) {
    const stocks = this.getStocks();

    const { name, quantity } = parsedPurchaseInfo;

    const hasPromotion = Boolean(stocks[name].promotion);
    const promotionName = stocks[name].promotion?.promotion;

    if (hasPromotion) {
      const promotions = this.getPromotions();
      const stockQuantity = stocks[name].promotion.quantity;

      const { buy, startDate, endDate } = promotions[promotionName];

      const today = DateTimes.now().toISOString().split('T')[0];

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
    const stocks = this.getStocks();

    const { name, quantity } = parsedPurchaseInfo;

    const hasPromotion = Boolean(stocks[name].promotion);
    const promotionName = stocks[name].promotion?.promotion;

    if (hasPromotion) {
      const promotions = this.getPromotions();
      const stockQuantity = stocks[name].promotion.quantity;

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
    const stocks = this.getStocks();

    const { name, quantity } = parsedPurchaseInfo;

    const hasPromotion = Boolean(stocks[name].promotion);
    const promotionName = stocks[name].promotion?.promotion;

    if (hasPromotion) {
      const promotions = this.getPromotions();
      const stockQuantity = stocks[name].promotion.quantity;

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
    const stocks = this.getStocks();

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
        price: info.quantity * stocks[info.name].default.price,
      });

      receipt.totalPurchasePrice.quantity += info.quantity;
      receipt.totalPurchasePrice.price += info.quantity * stocks[info.name].default.price;

      const promotableItem = this.getPromotionInfo(info);

      if (promotableItem) {
        receipt.promotionInfo.push(promotableItem);
      }
    });

    receipt.promotionInfo.forEach((info) => {
      receipt.promotionDiscountPrice += info.quantity * stocks[info.name].default.price;
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
    const purchaseInfoRegex = /^\[[가-힣]+-\d+\]$/;
    const purchaseInfoNameCaptureRegex = /^\[([가-힣]+)-\d+\]$/;
    const purchaseInfoQuantityCaptureRegex = /^\[[가-힣]+-(\d+)\]$/;

    if (purchaseInfo === '') {
      throw new Error(ConvenienceModel.ERROR_MESSAGE.CAN_NOT_BE_EMPTY);
    }

    purchaseInfo.split(',').forEach((item) => {
      if (!purchaseInfoRegex.test(item.trim())) {
        throw new Error(ConvenienceModel.ERROR_MESSAGE.INVALID_INPUT_FORMAT);
      }
    });

    const stocks = this.getStocks();

    const stockNames = Object.keys(stocks);

    purchaseInfo.split(',').forEach((item) => {
      const purchaseInfoName = item.trim().match(purchaseInfoNameCaptureRegex)[1];
      const purchaseInfoQuantity = item.trim().match(purchaseInfoQuantityCaptureRegex)[1];

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
