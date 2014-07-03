create table users (
  name varchar(16) primary key,
  password text,
  fullname text,
  email text,
  update_date timestamp
);

create table sessions (
  sid varchar(32) primary key,
  value text,
  username varchar(16) references users (name),
  create_date datetime,
  update_date timestamp,
  update_count int default 0
);
