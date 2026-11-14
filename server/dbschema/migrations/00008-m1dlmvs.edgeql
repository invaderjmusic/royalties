CREATE MIGRATION m1dlmvswru2akl2n2mvxzsn24ejoxxcii466aqvvsi77vkpuntijva
    ONTO m1ablwuyf3zykpgvgymxi743qmd2gy2exvgx4u4j6cvjh23arukkra
{
  CREATE TYPE default::SalePayout {
      CREATE REQUIRED LINK user: default::User;
      CREATE PROPERTY amount: std::int64;
      CREATE REQUIRED PROPERTY date: cal::local_date;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK product_splits: default::ProductSplit {
          ON TARGET DELETE ALLOW;
      };
  };
};
