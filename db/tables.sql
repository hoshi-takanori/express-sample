create table sessions (
  sid varchar(32) primary key,
  value text,
  create_date datetime,
  update_date timestamp,
  update_count int default 0
);
