CREATE TABLE tr_invoiceheader (
    ih_seq INT NOT NULL IDENTITY PRIMARY KEY,
    ih_number INT NOT NULL,
    ih_clientname VARCHAR(100),
    ih_total DECIMAL(18, 2),
    ih_adddate DATETIME DEFAULT GETDATE()
);
CREATE TABLE tr_invoicedetail (
    id_seq INT NOT NULL IDENTITY PRIMARY KEY,
    id_itemname VARCHAR(100),
    id_qty INT,
    id_price DECIMAL(18, 2),
	fk_ih_seq INT,
    CONSTRAINT FK_InvoiceHeader FOREIGN KEY (fk_ih_seq)
        REFERENCES tr_invoiceheader (ih_seq)
);
CREATE TABLE tr_invseq (
    is_seq INT NOT NULL
);
INSERT INTO tr_invseq (is_seq) VALUES (0);


---FIRST PROCEDURE
CREATE OR ALTER PROCEDURE spwv_tr_insertinvoiceheader
    @ih_clientname VARCHAR(100),
    @ih_total DECIMAL(18, 2)
AS
BEGIN
    DECLARE @ih_number INT;
    SET @ih_number = (SELECT is_seq + 1 FROM tr_invseq);
    UPDATE tr_invseq SET is_seq = is_seq + 1;

    INSERT INTO tr_invoiceheader (ih_number, ih_clientname, ih_total, ih_adddate)
    VALUES (@ih_number, @ih_clientname, @ih_total, GETDATE());
    
    DECLARE @ih_seq INT;
    SET @ih_seq = SCOPE_IDENTITY();
    SELECT @ih_seq AS Ih_seq FROM tr_invoiceheader WHERE ih_seq = @ih_seq;
END;
go
-- Execute the stored procedure with sample data
DECLARE @result INT;

EXEC spwv_tr_insertinvoiceheader
    @ih_clientname = 'Sample Client',
    @ih_total = 0.0;
go

---SECONDE PROCEDURE
CREATE OR ALTER PROCEDURE spwv_tr_insertinvoicedetail
    @fk_ih_seq INT,
    @id_itemname VARCHAR(100),
    @id_qty INT,
    @id_price INT,
    @id_seq INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @new_id_seq INT;

    BEGIN TRANSACTION;

    INSERT INTO tr_invoicedetail (fk_ih_seq, id_itemname, id_qty, id_price)
    VALUES (@fk_ih_seq, @id_itemname, @id_qty, @id_price);

    SET @new_id_seq = SCOPE_IDENTITY();

    UPDATE tr_invoiceheader
    SET ih_total = (SELECT SUM(id_qty * id_price) FROM tr_invoicedetail WHERE fk_ih_seq = @fk_ih_seq)
    WHERE ih_seq = @fk_ih_seq;

    COMMIT TRANSACTION;
    SET @id_seq = @new_id_seq;
END;
GO

DECLARE @new_id_seq INT;
EXEC spwv_tr_insertinvoicedetail 
    @fk_ih_seq = 3, 
    @id_itemname = 'Body Cream', 
    @id_qty = 1, 
    @id_price = 25, 
    @id_seq = @new_id_seq OUTPUT;

SELECT @new_id_seq AS NewDetailSequence;
go

---THIRD PROCEDURE
CREATE or alter PROCEDURE spwv_tr_updateclientname
    @ih_seq INT,
    @new_clientname VARCHAR(100),
    @updated_id INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE tr_invoiceheader SET ih_clientname = @new_clientname WHERE ih_seq = @ih_seq;
	SET @updated_id = @ih_seq;
END;
GO


EXEC spwv_tr_updateclientname 
    @ih_seq = 3, 
    @new_clientname = 'Malika';
go

---Fourth PROCEDURE
CREATE OR ALTER PROCEDURE spwv_tr_updateinvoicedetail
    @id_seq INT,
    @id_itemname VARCHAR(100),
    @id_qty INT,
    @id_price DECIMAL(18, 2),
	@updated_total DECIMAL(18, 2) OUTPUT
AS
BEGIN

    UPDATE tr_invoicedetail
    SET id_itemname = @id_itemname,
        id_qty = @id_qty,
        id_price = @id_price
    WHERE id_seq = @id_seq;

    DECLARE @fk_ih_seq INT;
    SELECT @fk_ih_seq = fk_ih_seq FROM tr_invoicedetail WHERE id_seq = @id_seq;

    UPDATE tr_invoiceheader
    SET ih_total = (SELECT SUM(id_qty * id_price) FROM tr_invoicedetail WHERE fk_ih_seq = @fk_ih_seq)
    WHERE ih_seq = @fk_ih_seq;
	SELECT @updated_total = ih_total FROM tr_invoiceheader WHERE ih_seq = @fk_ih_seq;
END;

GO

EXEC spwv_tr_updateinvoicedetail 
    @id_seq = 2, 
    @id_itemname = 'Dubai chocolate',
    @id_qty = 3, 
    @id_price = 150;

go
---Fifth PROCEDURE
CREATE OR ALTER PROCEDURE spwv_tr_deleteinvoice
    @ih_seq INT
AS
BEGIN
    BEGIN TRANSACTION;
    DELETE FROM tr_invoicedetail WHERE fk_ih_seq = @ih_seq;
    DELETE FROM tr_invoiceheader WHERE ih_seq = @ih_seq;

    IF @@ROWCOUNT > 0
    BEGIN
        COMMIT TRANSACTION;
        SELECT 1 AS Result;
    END
    ELSE
    BEGIN
        ROLLBACK TRANSACTION;
        SELECT 0 AS Result;
    END;
END;
GO

DECLARE @delete_invoice INT;

EXEC spwv_tr_deleteinvoice 
    @ih_seq =2 ,
    @result = @delete_invoice OUTPUT;

SELECT @delete_invoice AS DeleteInvoice;
go

---Sixth PROCEDURE
CREATE or alter PROCEDURE spwv_tr_deleteinvoicedetail
    @id_seq INT
AS
BEGIN
    DELETE FROM tr_invoicedetail WHERE id_seq = @id_seq;

    DECLARE @fk_ih_seq INT;
    SELECT @fk_ih_seq = fk_ih_seq FROM tr_invoicedetail WHERE id_seq = @id_seq;

    UPDATE tr_invoiceheader
    SET ih_total = (SELECT COALESCE(SUM(id_qty * id_price), 0) FROM tr_invoicedetail WHERE fk_ih_seq = @fk_ih_seq)
    WHERE ih_seq = @fk_ih_seq;
   
    SELECT ih_total AS UpdatedTotal FROM tr_invoiceheader WHERE ih_seq = @fk_ih_seq;
END;
GO

---Seventh PROCEDURE
CREATE PROCEDURE spwv_tr_selectallinvoiceheader
AS
BEGIN
    SELECT * FROM tr_invoiceheader;
END;
go
EXEC spwv_tr_selectallinvoiceheader;
GO
---Eighth PROCEDURE
CREATE PROCEDURE spwv_tr_selectallinvoicedetailbyihseq
    @ih_seq INT
AS
BEGIN
    SELECT * FROM tr_invoicedetail WHERE fk_ih_seq = @ih_seq;
END;
GO
EXEC spwv_tr_selectallinvoicedetailbyihseq 
    @ih_seq = 3;
go
---GetAllDetailsByIdSeq
CREATE PROCEDURE spwv_tr_selectalldetailbyidseq
    @id_seq INT
AS
BEGIN
    SELECT * FROM tr_invoicedetail WHERE id_seq = @id_seq;
END;
GO
EXEC spwv_tr_selectalldetailbyidseq 
    @id_seq = 12;
go
SELECT * FROM tr_invoicedetail ;
SELECT * FROM tr_invoiceheader;
