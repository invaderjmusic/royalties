CREATE MIGRATION m1cysqjdbaz43unkdwc3mylhwgglhz4rq7smh6mdpnzmlk2ouzae5q
    ONTO m1xkyge5tmqzel5grfgmiyhy7dqvgjympejrbhuekypoyozop5r56q
{
  CREATE TYPE default::Payout {
      CREATE REQUIRED LINK user: default::User;
      CREATE PROPERTY amount: std::int64;
  };
  CREATE TYPE default::Transaction {
      CREATE MULTI LINK payouts: default::Payout {
          ON TARGET DELETE ALLOW;
      };
      CREATE REQUIRED PROPERTY withdrawal: std::int64;
  };
};
