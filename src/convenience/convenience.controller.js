/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { read } from '../lib/file.js';
import { safeInput } from '../lib/utils.js';
import ConvenienceModel from './convenience.model.js';
import ConvenienceView from './convenience.view.js';

class ConvenienceController {
  #view;

  #model;

  constructor(view = new ConvenienceView(), model = new ConvenienceModel()) {
    this.#view = view;
    this.#model = model;
  }

  #openConvenience() {
    this.#model.setStock(read('../../public/products.md'));
    this.#model.setPromotion(read('../../public/promotions.md'));
  }

  #guideConvenience() {
    this.#view.printWelcomeMessage();
    this.#view.printStocksInfo();
    this.#view.printStocks(this.#model.getStocks());
  }

  #handlePurchseInfoInput = (info) => {
    this.#model.validatePurchaseInfo(info);
    this.#view.printLineBreak();
  };

  #handleError = (error) => {
    this.#view.printErrorMessage(error);
    this.#view.printLineBreak();
  };

  async #readPurchaseInfo() {
    const purchaseInfo = await safeInput(this.#view.getPurcharseInfo, {
      onInput: this.#handlePurchseInfoInput,
      onError: this.#handleError,
    });

    return this.#model.parsePurchaseInfo(purchaseInfo);
  }

  #handleShouldAddItemForPromotion = (answer) => {
    this.#model.validateYesNoAnswer(answer);
    this.#view.printLineBreak();
  };

  async #readShouldAddItemForPromotion(promotableItem) {
    const answer = await safeInput(() => this.#view.getShouldAddItemForPromotion(promotableItem), {
      onInput: this.#handleShouldAddItemForPromotion,
      onError: this.#handleError,
    });

    return answer;
  }

  #handleShouldAddItemWithoutPromotion = (answer) => {
    this.#model.validateYesNoAnswer(answer);
    this.#view.printLineBreak();
  };

  async #readShouldAddItemWithoutPromotion(name, quantity) {
    const answer = await safeInput(
      () => this.#view.getShouldAddItemWithoutPromotion(name, quantity),
      {
        onInput: this.#handleShouldAddItemWithoutPromotion,
        onError: this.#handleError,
      },
    );

    return answer;
  }

  #handleIsMembershipDiscount = (answer) => {
    this.#model.validateYesNoAnswer(answer);
    this.#view.printLineBreak();
  };

  async #readIsMembershipDiscount() {
    const answer = await safeInput(this.#view.getIsMembershipDiscount, {
      onInput: this.#handleIsMembershipDiscount,
      onError: this.#handleError,
    });

    return answer;
  }

  async #processPromotableItems(parsedPurchaseInfo) {
    const promotableItems = this.#model.getPromotableItems(parsedPurchaseInfo);
    const shouldAddItemForPromotionList = [];

    for (const promotableItem of promotableItems) {
      if (promotableItem === null) {
        continue;
      }

      const answer = await this.#readShouldAddItemForPromotion(promotableItem);

      if (answer === 'Y') {
        shouldAddItemForPromotionList.push(promotableItem);
      }
    }

    // 증정 받을 수 있는 상품을 추가한다.
    shouldAddItemForPromotionList.forEach((item) => {
      const itemIndex = parsedPurchaseInfo.findIndex((info) => info.name === item);
      // eslint-disable-next-line no-param-reassign
      parsedPurchaseInfo[itemIndex].quantity += 1;
    });
  }

  async #processNonPromotionalItems(parsedPurchaseInfo) {
    // 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우
    const nonPromotionalItems = this.#model.getNonPromotionalItems(parsedPurchaseInfo);
    const shouldAddItemWithoutPromotionList = [];

    for (const nonPromotionalItem of nonPromotionalItems) {
      if (nonPromotionalItem === null) {
        continue;
      }

      const answer = await this.#readShouldAddItemWithoutPromotion(
        nonPromotionalItem.name,
        nonPromotionalItem.quantity,
      );

      if (answer === 'N') {
        shouldAddItemWithoutPromotionList.push({
          name: nonPromotionalItem.name,
          quantity: nonPromotionalItem.quantity,
        });
      }
    }

    // 정가로 결제해야하는 수량만큼 제외한 후 결제를 진행한다.
    shouldAddItemWithoutPromotionList.forEach((item) => {
      const itemIndex = parsedPurchaseInfo.findIndex((info) => info.name === item.name);
      // eslint-disable-next-line no-param-reassign
      parsedPurchaseInfo[itemIndex].quantity -= item.quantity;
    });
  }

  async init() {
    this.#openConvenience();
    this.#guideConvenience();

    const parsedPurchaseInfo = await this.#readPurchaseInfo();

    await this.#processPromotableItems(parsedPurchaseInfo);
    await this.#processNonPromotionalItems(parsedPurchaseInfo);

    const isMembershipDiscount = await this.#readIsMembershipDiscount();

    const receipt = this.#model.getReceipt(parsedPurchaseInfo, isMembershipDiscount);

    this.#view.printReceipt(receipt);
  }
}

export default ConvenienceController;
