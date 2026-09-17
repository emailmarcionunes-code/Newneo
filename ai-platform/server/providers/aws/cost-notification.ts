import {
  SNSClient,
  ListSubscriptionsByTopicCommand,
  PublishCommand,
} from '@aws-sdk/client-sns';
import { type CostEvent, renderCostNotice } from '../../cost-notifications';
export function createCostSender(region: string, topicArn: string) {
  if (
    !/^arn:aws:sns:[a-z0-9-]+:\d{12}:newneo-cost-approvals$/.test(topicArn) ||
    topicArn.split(':')[3] !== region
  )
    throw new Error('Invalid cost alert topic');
  const sns = new SNSClient({ region, maxAttempts: 2 });
  return async (event: CostEvent) => {
    // Refuse publication until only the approved recipient is confirmed.
    let nextToken: string | undefined;
    let confirmed = false;
    do {
      const page = await sns.send(
        new ListSubscriptionsByTopicCommand({
          TopicArn: topicArn,
          NextToken: nextToken,
        }),
        { abortSignal: AbortSignal.timeout(15000) },
      );
      for (const subscription of page.Subscriptions ?? []) {
        if (
          subscription.Protocol !== 'email' ||
          subscription.Endpoint !== event.recipient
        )
          throw new Error('Unexpected topic subscriber');
        if (subscription.SubscriptionArn?.startsWith('arn:')) confirmed = true;
      }
      nextToken = page.NextToken;
    } while (nextToken);
    if (!confirmed) throw new Error('Email subscription is not confirmed');
    const notice = renderCostNotice(event);
    const result = await sns.send(
      new PublishCommand({
        TopicArn: topicArn,
        Subject: notice.subject,
        Message: notice.message,
      }),
      { abortSignal: AbortSignal.timeout(15000) },
    );
    if (!result.MessageId) throw new Error('No SNS receipt');
    return result.MessageId;
  };
}
