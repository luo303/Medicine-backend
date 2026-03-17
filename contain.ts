export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
interface db {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}
interface AI {
  ZHIPU_API_KEY: string;
}
export interface config {
  DB: db;
  AI: AI;
}
