CREATE MIGRATION m1t4v66si4gardjtbguh7tr5guzrkg3ksnmc3moapp3yklroekp6fa
    ONTO m1cysqjdbaz43unkdwc3mylhwgglhz4rq7smh6mdpnzmlk2ouzae5q
{
  ALTER TYPE default::Transaction {
      CREATE REQUIRED PROPERTY date: cal::local_date {
          SET REQUIRED USING (<cal::local_date>'2022-03-01');
      };
  };
};
