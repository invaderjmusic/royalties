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
      on source delete delete target;
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
    property signup_key -> str;
    multi link splits -> Split {
      on target delete allow;
    }
  }

  type Earning {
    required link user -> User;
    property amount -> int64;
  }

  type Payout {
    required link user -> User;
    property amount -> int64;
  }

  type Transaction {
    required property date -> cal::local_date;
    required property withdrawal -> int64;
    multi link payouts -> Payout {
      on target delete allow;
    } 
  }
};