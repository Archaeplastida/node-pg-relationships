\c biztime

DROP TABLE IF EXISTS industries_companies;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL UNIQUE
);

CREATE TABLE industries_companies (
  industry_code TEXT NOT NULL REFERENCES industries ON DELETE CASCADE,
  company_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  PRIMARY KEY(industry_code, company_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('walmart', 'Walmart', 'Multinational Retail.'),
         ('bank-of-america', 'Bank of America', 'Investment bank and financial services.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null),
         ('ibm', 200, true, '2019-05-20'),
         ('walmart', 150, true, '2020-11-20'),
         ('walmart', 300, false, null),
         ('walmart', 1000, false, null),
         ('bank-of-america', 800, false, null);

INSERT INTO industries
  VALUES ('acct', 'Accounting'),
         ('rt', 'Retailing'),
         ('sfe', 'Software Engineering');

INSERT INTO industries_companies
  VALUES ('sfe', 'apple'),
         ('rt', 'apple'),
         ('sfe', 'ibm'),
         ('rt', 'walmart'),
         ('acct', 'bank-of-america'),
         ('sfe', 'bank-of-america');