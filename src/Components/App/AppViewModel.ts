'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import { RouteHandlerViewModel, IRoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../Routing/RouteManager';
import AlertViewModel from '../Alert/AlertViewModel';
import { default as PubSub, ISubscriptionHandle } from '../../Utils/PubSub';
import Events from '../../Events';

export interface IAppConfig {
  EnablePropertyChangedDebugging: boolean;
  EnableViewRenderDebugging: boolean;
  EnableRouteDebugging: boolean;
  EnableStoreApiDebugging: boolean;

  routingMap: IRoutingMap;
}

export class AppViewModel extends BaseViewModel {
  constructor(public routeManager?: RouteManager, config = <IAppConfig>{}) {
    super();

    this.config = config;
    if (routeManager != null) {
      this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);
    }
  }

  private currentAlertKey = 0;

  private alertCreatedHandle: ISubscriptionHandle;

  public config: IAppConfig;
  public routeHandler: RouteHandlerViewModel;
  public alerts = wx.list<AlertViewModel>();

  public appendAlert(text: string, header?: string, style = 'info', timeout = 5000) {
		let alert = new AlertViewModel(this.alerts, ++this.currentAlertKey, text, header, style, timeout);

		this.alerts.add(alert);

		return alert;
	}

  public initialize() {
    super.initialize();

    this.alertCreatedHandle = PubSub.subscribe(Events.AlertCreated, x => this.appendAlert(x[0] as string, x[1] as string, x[2] as string, x[3] as number));
  }

  public cleanup() {
    super.cleanup();

    this.alertCreatedHandle = PubSub.unsubscribe(this.alertCreatedHandle);
  }
}

export default AppViewModel;
