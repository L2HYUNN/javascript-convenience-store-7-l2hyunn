import ConvenienceController from './convenience/convenience.controller.js';

class App {
  async run() {
    await new ConvenienceController().init();
  }
}

export default App;
