CREATE MIGRATION m167f4h6s6425zizedh64iztrdty3i52t7bbujv4b25j7aeyrrptva
    ONTO initial
{
  CREATE FUTURE nonrecursive_access_policies;
  CREATE TYPE default::Earning {
      CREATE PROPERTY amount -> std::int64;
  };
  CREATE TYPE default::Royalty {
      CREATE MULTI LINK earnings -> default::Earning {
          ON TARGET DELETE ALLOW;
      };
      CREATE PROPERTY amount -> std::int64;
      CREATE REQUIRED PROPERTY date -> cal::local_date;
  };
  CREATE TYPE default::Song {
      CREATE MULTI LINK royalties -> default::Royalty {
          ON TARGET DELETE ALLOW;
      };
      CREATE REQUIRED PROPERTY name -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE default::Split {
      CREATE LINK song -> default::Song;
      CREATE PROPERTY percentage -> std::int64;
  };
  CREATE TYPE default::User {
      CREATE MULTI LINK splits -> default::Split;
      CREATE REQUIRED PROPERTY is_admin -> std::bool;
      CREATE PROPERTY password_hash -> std::str;
      CREATE PROPERTY password_salt -> std::str;
      CREATE REQUIRED PROPERTY primary_contact -> std::str;
      CREATE REQUIRED PROPERTY username -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Earning {
      CREATE REQUIRED LINK user -> default::User;
  };
  CREATE TYPE default::Release {
      CREATE MULTI LINK songs -> default::Song;
      CREATE REQUIRED PROPERTY name -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY release_date -> cal::local_date;
  };
};
