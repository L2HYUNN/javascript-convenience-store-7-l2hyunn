import ConvenienceView from './convenience/convenience.view.js';
import ConvenienceModel from './convenience/convenience.model.js';
import { read } from './lib/file.js';

class App {
  async run() {
    new ConvenienceView().printWelcomeMessage();

    new ConvenienceView().printStocksInfo();

    new ConvenienceView().printStocks(
      new ConvenienceModel(read('../../public/products.md')).getStocks(),
    );
  }
}

export default App;
