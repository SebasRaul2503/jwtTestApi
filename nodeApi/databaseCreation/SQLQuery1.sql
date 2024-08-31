CREATE DATABASE apiEjemplo;
GO

USE apiEjemplo;
GO

CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL
);
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);
GO

-- INSERTAMOS DATOS DE PRUEBA
INSERT INTO roles VALUES
('Administrador'),
('Usuario');
GO

-- PROCEDIMIENTOS ALMACENADOS
CREATE PROCEDURE sp_RegistrarUsuario
    @nombre NVARCHAR(100),
    @email NVARCHAR(100),
    @password NVARCHAR(255),
    @rol_id INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validamos si el correo ya esta registrado
        IF EXISTS (SELECT 1 FROM usuarios WHERE email = @email)
        BEGIN
            THROW 50000, 'El correo electronico ya esta registrado.', 1;
        END

        -- Insertamos el nuevo usuario en caso el correo no este registrado
        INSERT INTO usuarios (nombre, email, password, rol_id)
        VALUES (@nombre, @email, @password, @rol_id);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;

        -- Manejo de errores
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT @ErrorMessage = ERROR_MESSAGE(),
               @ErrorSeverity = ERROR_SEVERITY(),
               @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

GO
