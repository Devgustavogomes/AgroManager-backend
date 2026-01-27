export interface findProducerOutput {
  id_producer: string;
  username: string;
  password_hash: string;
  role: string;
}

export abstract class AuthContract {
  abstract findProducer(email: string): Promise<findProducerOutput>;
}
