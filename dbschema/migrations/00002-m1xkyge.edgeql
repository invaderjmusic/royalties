CREATE MIGRATION m1xkyge5tmqzel5grfgmiyhy7dqvgjympejrbhuekypoyozop5r56q
    ONTO m167f4h6s6425zizedh64iztrdty3i52t7bbujv4b25j7aeyrrptva
{
  ALTER TYPE default::User {
      ALTER LINK splits {
          ON TARGET DELETE ALLOW;
      };
  };
};
