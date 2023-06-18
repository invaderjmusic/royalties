module default {
  type Release {
    required property name -> str {
        constraint exclusive;
    }
    required property release_date -> cal::local_date;
    multi link songs -> Song;
  }

  type Song {
    required property name -> str {
        constraint exclusive;
    }
    multi link royalties -> Royalty {
      on target delete allow;
    }
  }

  type Royalty {
    required property date -> cal::local_date;
    property amount -> int64;
    multi link earnings -> Earning  {
      on target delete allow;
    }
  }

  type Split {
    link song -> Song;
    property percentage -> int64;
  }

  type User {
    required property username -> str {
        constraint exclusive;
    }
    required property is_admin -> bool;
    required property primary_contact -> str;
    property password_salt -> str;
    property password_hash -> str;
    multi link splits -> Split;
  }

  type Earning {
    required link user -> User;
    property amount -> int64;
  }
};