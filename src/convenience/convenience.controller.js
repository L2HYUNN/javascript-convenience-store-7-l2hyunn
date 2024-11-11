/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { read, write } from '../lib/file.js';
import { filterNonNull, safeInput } from '../lib/utils.js';
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

  #handleIsAdditionalPurchaseWanted = (answer) => {
    this.#model.validateYesNoAnswer(answer);
    this.#view.printLineBreak();
  };

  async #readIsAdditionalPurchaseWanted() {
    const answer = await safeInput(this.#view.getIsAdditionalPurchaseWanted, {
      onInput: this.#handleIsAdditionalPurchaseWanted,
      onError: this.#handleError,
    });

    return answer;
  }

  async #createshouldAddItemForPromotionList(promotableItems, shouldAddItemForPromotionList) {
    for (const promotableItem of promotableItems) {
      const answer = await this.#readShouldAddItemForPromotion(promotableItem);

      if (answer === 'Y') shouldAddItemForPromotionList.push(promotableItem);
    }
  }

  async #createShouldAddItemForPromotion(promotableItems) {
    const shouldAddItemForPromotionList = [];

    await this.#createshouldAddItemForPromotionList(promotableItems, shouldAddItemForPromotionList);

    return shouldAddItemForPromotionList;
  }

  #addItemForPromotion(parsedPurchaseInfo, shouldAddItemForPromotionList) {
    shouldAddItemForPromotionList.forEach((item) => {
      const itemIndex = parsedPurchaseInfo.findIndex((info) => info.name === item);
      parsedPurchaseInfo[itemIndex].quantity += 1;
    });
  }

  async #processPromotableItems(parsedPurchaseInfo) {
    const promotableItems = this.#model.getPromotableItems(parsedPurchaseInfo);
    const shouldAddItemForPromotionList = await this.#createShouldAddItemForPromotion(
      filterNonNull(promotableItems),
    );

    this.#addItemForPromotion(parsedPurchaseInfo, shouldAddItemForPromotionList);
  }

  async #createshouldAddItemWithoutPromotionList(
    nonPromotionalItems,
    shouldAddItemWithoutPromotionList,
  ) {
    for (const { name, quantity } of nonPromotionalItems) {
      const answer = await this.#readShouldAddItemWithoutPromotion(name, quantity);

      if (answer === 'N') {
        shouldAddItemWithoutPromotionList.push({ name, quantity });
      }
    }
  }

  async #createshouldAddItemWithoutPromotion(nonPromotionalItems) {
    const shouldAddItemWithoutPromotionList = [];

    await this.#createshouldAddItemWithoutPromotionList(
      nonPromotionalItems,
      shouldAddItemWithoutPromotionList,
    );

    return shouldAddItemWithoutPromotionList;
  }

  #addItemWithoutPromotion(parsedPurchaseInfo, shouldAddItemWithoutPromotionList) {
    shouldAddItemWithoutPromotionList.forEach((item) => {
      const itemIndex = parsedPurchaseInfo.findIndex((info) => info.name === item.name);
      parsedPurchaseInfo[itemIndex].quantity -= item.quantity;
    });
  }

  async #processNonPromotionalItems(parsedPurchaseInfo) {
    const nonPromotionalItems = this.#model.getNonPromotionalItems(parsedPurchaseInfo);
    const shouldAddItemWithoutPromotionList = await this.#createshouldAddItemWithoutPromotion(
      filterNonNull(nonPromotionalItems),
    );

    this.#addItemWithoutPromotion(parsedPurchaseInfo, shouldAddItemWithoutPromotionList);
  }

  async #processPromotionItems(parsedPurchaseInfo) {
    await this.#processPromotableItems(parsedPurchaseInfo);
    await this.#processNonPromotionalItems(parsedPurchaseInfo);
  }

  async #printReceipt(parsedPurchaseInfo, isMembershipDiscount) {
    const receipt = this.#model.getReceipt(parsedPurchaseInfo, isMembershipDiscount);

    this.#model.updateStock(parsedPurchaseInfo);

    this.#view.printReceipt(receipt);
  }

  async #serviceConvenience() {
    const parsedPurchaseInfo = await this.#readPurchaseInfo();

    await this.#processPromotionItems(parsedPurchaseInfo);

    const isMembershipDiscount = await this.#readIsMembershipDiscount();

    await this.#printReceipt(parsedPurchaseInfo, isMembershipDiscount);
  }

  async #askReopenCovenience() {
    const answer = await this.#readIsAdditionalPurchaseWanted();

    return answer;
  }

  async #reopenConvenience(answer) {
    if (answer === 'Y') {
      await this.init();
    }
  }

  async #closeConvenience() {
    const text = this.#model.convertStockToText();
    write('../../public/products.md', text.join('\n'));

    const answer = await this.#askReopenCovenience();
    await this.#reopenConvenience(answer);
  }

  async init() {
    this.#openConvenience();
    this.#guideConvenience();
    await this.#serviceConvenience();
    await this.#closeConvenience();
  }
}

export default ConvenienceController;
