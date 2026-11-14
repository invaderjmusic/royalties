CREATE MIGRATION m1n4ujkmee2kd5mj6qq5dxb73nxvmyydl3s45n7kwx2c6z7sapv7aa
    ONTO m1t4v66si4gardjtbguh7tr5guzrkg3ksnmc3moapp3yklroekp6fa
{
  ALTER TYPE default::User {
      CREATE PROPERTY signup_key: std::str;
  };
};
