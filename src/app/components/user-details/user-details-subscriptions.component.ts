import { Component, Input, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { MessagingResource } from '../../entities-messaging/messaging-resource';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { ConfigurationService } from '../../services/configuration.service';
import { BehaviorSubject } from 'rxjs';
import { MessagingService } from '../../services/messaging-service';
import { UserService } from 'yti-common-ui/services/user.service';

@Component({
  selector: 'app-user-details-subscriptions',
  styleUrls: ['./user-details-subscriptions.component.scss'],
  templateUrl: './user-details-subscriptions.component.html',
})
export class UserDetailsSubscriptionsComponent implements OnInit {

  @Input() tabSet: NgbTabset;

  messagingResources$ = new BehaviorSubject<Map<string, MessagingResource[]> | null>(null);

  subscriptionType: string;

  loading = true;

  APPLICATION_CODELIST = 'codelist';
  APPLICATION_TERMINOLOGY = 'terminology';
  APPLICATION_DATAMODEL = 'datamodel';
  APPLICATION_COMMENTS = 'comments';

  constructor(public languageService: LanguageService,
              private messagingService: MessagingService,
              private configurationService: ConfigurationService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private errorModalService: CodeListErrorModalService) {
  }

  ngOnInit() {

    if (this.configurationService.isMessagingEnabled && !this.userService.user.anonymous) {
      this.getUserSubscriptionData();
    } else {
      this.loading = false;
    }
  }

  getUserSubscriptionData() {

    this.loading = true;

    this.messagingService.getMessagingUserData().subscribe(messagingUserData => {
      this.loading = false;

      if (messagingUserData) {
        const resources = new Map<string, MessagingResource[]>();
        const codelistMessagingResources: MessagingResource[] = [];
        const datamodelMessagingResources: MessagingResource[] = [];
        const terminologyMessagingResources: MessagingResource[] = [];
        const commentsMessagingResources: MessagingResource[] = [];

        messagingUserData.resources.forEach(resource => {
          if (resource.application === this.APPLICATION_CODELIST) {
            codelistMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_DATAMODEL) {
            datamodelMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_TERMINOLOGY) {
            terminologyMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_COMMENTS) {
            commentsMessagingResources.push(resource);
          }
        });
        if (codelistMessagingResources.length > 0) {
          resources.set(this.APPLICATION_CODELIST, codelistMessagingResources);
        }
        if (datamodelMessagingResources.length > 0) {
          resources.set(this.APPLICATION_DATAMODEL, datamodelMessagingResources);
        }
        if (terminologyMessagingResources.length > 0) {
          resources.set(this.APPLICATION_TERMINOLOGY, terminologyMessagingResources);
        }
        if (commentsMessagingResources.length > 0) {
          resources.set(this.APPLICATION_COMMENTS, commentsMessagingResources);
        }
        if (resources.size > 0) {
          this.messagingResources = resources;
        } else {
          this.messagingResources = null;
        }
      } else {
        this.messagingResources = null;
      }
    });
  }

  get messagingResources(): Map<string, MessagingResource[]> | null {

    return this.messagingResources$.getValue();
  }

  set messagingResources(value: Map<string, MessagingResource[]> | null) {

    this.messagingResources$.next(value);
  }

  removeSubscription(resource: MessagingResource) {

    this.confirmationModalService.openRemoveSubscription()
      .then(() => {
        this.messagingService.deleteSubscription(resource.uri).subscribe(success => {
          if (success) {
            const messagingResources = this.messagingResources;
            if (messagingResources != null) {
              const resources = messagingResources.get(resource.application);
              if (resources != null) {
                const resourceIndex = resources.indexOf(resource, 0);
                if (resourceIndex > -1) {
                  resources.splice(resourceIndex, 1);
                }
                if (resources.length === 0) {
                  messagingResources.delete(resource.application);
                  this.messagingResources = messagingResources;
                }
                if (messagingResources.size === 0) {
                  this.tabSet.select('user_details_info_tab');
                }
              }
            }
          } else {
            this.errorModalService.open('Submit error', 'Subscription deletion failed.', null);
          }
        });
      }, ignoreModalClose);
  }

  get isSubscriptionEnabled(): boolean {

    return this.subscriptionType !== 'DISABLED';
  }

  toggleSubscription() {

    const subscriptionTargetType = this.subscriptionType === 'DAILY' ? 'DISABLED' : 'DAILY';

    this.confirmationModalService.openToggleNotifications(subscriptionTargetType === 'DAILY')
      .then(() => {
        this.messagingService.setSubscriptionType(subscriptionTargetType).subscribe(messagingUserData => {
          this.subscriptionType = messagingUserData.subscriptionType;
        });
      }, ignoreModalClose);
  }

  getUriWithEnv(uri: string): string | null {

    return this.configurationService.getUriWithEnv(uri);
  }

  getCommentsUriWithEnv(uri: string): string | null {

    switch (this.configurationService.env) {
      case 'awsprod':
        return 'https://kommentit.suomi.fi/commentround;commentRoundId=' + uri;
      case 'awstest':
        return 'https://kommentit.dev.yti.cloud.vrk.fi/commentround;commentRoundId=' + uri;
      case 'awsdev':
        return 'https://kommentit.dev.yti.cloud.vrk.fi/commentround;commentRoundId=' + uri;
      case 'local':
        return 'http://localhost:9700/commentround;commentRoundId=' + uri;
      default:
        return this.getUriWithEnv(uri);
    }
  }
}