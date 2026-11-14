CREATE MIGRATION m1ablwuyf3zykpgvgymxi743qmd2gy2exvgx4u4j6cvjh23arukkra
    ONTO m1ujrwlcalitxetd5dy2z6hcvzij4vkdkuxvynglb5l7rpukuq7hsq
{
  CREATE TYPE default::SaleEarning {
      CREATE REQUIRED LINK user: default::User;
      CREATE PROPERTY amount: std::int64;
  };
  CREATE TYPE default::Sale {
      CREATE MULTI LINK earnings: default::SaleEarning {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
      };
      CREATE PROPERTY amount: std::int64;
      CREATE PROPERTY count: std::int64;
      CREATE REQUIRED PROPERTY date: cal::local_date;
  };
  CREATE TYPE default::Product {
      CREATE MULTI LINK sales: default::Sale {
          ON TARGET DELETE ALLOW;
      };
      CREATE PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY url: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE default::ProductSplit {
      CREATE LINK product: default::Product;
      CREATE PROPERTY percentage: std::int64;
  };
};
