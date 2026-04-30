declare module "web-push" {
  type PushSubscription = {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  type RequestOptions = {
    TTL?: number;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
  };

  type WebPush = {
    setVapidDetails: (subject: string, publicKey: string, privateKey: string) => void;
    sendNotification: (
      subscription: PushSubscription,
      payload?: string,
      options?: RequestOptions
    ) => Promise<unknown>;
  };

  const webpush: WebPush;
  export default webpush;
}
