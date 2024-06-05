CREATE MIGRATION m1ujrwlcalitxetd5dy2z6hcvzij4vkdkuxvynglb5l7rpukuq7hsq
    ONTO m1n4ujkmee2kd5mj6qq5dxb73nxvmyydl3s45n7kwx2c6z7sapv7aa
{
  ALTER TYPE default::Royalty {
      ALTER LINK earnings {
          ON SOURCE DELETE DELETE TARGET;
      };
  };
};
