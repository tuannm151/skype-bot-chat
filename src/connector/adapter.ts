import { CloudAdapter, ConfigurationBotFrameworkAuthentication, ConfigurationBotFrameworkAuthenticationOptions } from 'botbuilder';

class AdapterSingleton {
  private static adapter: CloudAdapter;
  public static botFrameworkAuthentication: ConfigurationBotFrameworkAuthentication;

  private constructor() {
      AdapterSingleton.botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env as ConfigurationBotFrameworkAuthenticationOptions);
      AdapterSingleton.adapter = new CloudAdapter(AdapterSingleton.botFrameworkAuthentication);
  }

  public static getAdapter(): CloudAdapter {
      if (!AdapterSingleton.adapter) {
          new AdapterSingleton();
      }
      return AdapterSingleton.adapter;
  }

  public static recreateInstance(): CloudAdapter {
      new AdapterSingleton();
      return AdapterSingleton.adapter;
  }
}

const adapter = AdapterSingleton.getAdapter();
const botFrameworkAuthentication = AdapterSingleton.botFrameworkAuthentication;

export {
    adapter,
    AdapterSingleton,
    botFrameworkAuthentication
};