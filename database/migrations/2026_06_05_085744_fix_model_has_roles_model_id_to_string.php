<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ubah kolom model_id di tabel pivot Spatie Permission
     * dari unsignedBigInteger menjadi string(36) agar
     * kompatibel dengan UUID primary key pada tabel users.
     */
    public function up(): void
    {
        // Gunakan raw SQL karena MySQL tidak mengizinkan drop primary
        // jika masih ada foreign key yang merujuk ke kolom tersebut.

        // -------- model_has_roles --------
        DB::statement('ALTER TABLE model_has_roles DROP FOREIGN KEY model_has_roles_role_id_foreign');
        DB::statement('ALTER TABLE model_has_roles DROP PRIMARY KEY');
        DB::statement('DROP INDEX model_has_roles_model_id_model_type_index ON model_has_roles');
        DB::statement('ALTER TABLE model_has_roles MODIFY model_id VARCHAR(36) NOT NULL');
        DB::statement('ALTER TABLE model_has_roles ADD PRIMARY KEY (role_id, model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_roles ADD INDEX model_has_roles_model_id_model_type_index (model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_roles ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE');

        // -------- model_has_permissions --------
        DB::statement('ALTER TABLE model_has_permissions DROP FOREIGN KEY model_has_permissions_permission_id_foreign');
        DB::statement('ALTER TABLE model_has_permissions DROP PRIMARY KEY');
        DB::statement('DROP INDEX model_has_permissions_model_id_model_type_index ON model_has_permissions');
        DB::statement('ALTER TABLE model_has_permissions MODIFY model_id VARCHAR(36) NOT NULL');
        DB::statement('ALTER TABLE model_has_permissions ADD PRIMARY KEY (permission_id, model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_permissions ADD INDEX model_has_permissions_model_id_model_type_index (model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_permissions ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE');
    }

    public function down(): void
    {
        // Kembalikan ke unsignedBigInteger
        DB::statement('ALTER TABLE model_has_roles DROP FOREIGN KEY model_has_roles_role_id_foreign');
        DB::statement('ALTER TABLE model_has_roles DROP PRIMARY KEY');
        DB::statement('DROP INDEX model_has_roles_model_id_model_type_index ON model_has_roles');
        DB::statement('ALTER TABLE model_has_roles MODIFY model_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE model_has_roles ADD PRIMARY KEY (role_id, model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_roles ADD INDEX model_has_roles_model_id_model_type_index (model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_roles ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE');

        DB::statement('ALTER TABLE model_has_permissions DROP FOREIGN KEY model_has_permissions_permission_id_foreign');
        DB::statement('ALTER TABLE model_has_permissions DROP PRIMARY KEY');
        DB::statement('DROP INDEX model_has_permissions_model_id_model_type_index ON model_has_permissions');
        DB::statement('ALTER TABLE model_has_permissions MODIFY model_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE model_has_permissions ADD PRIMARY KEY (permission_id, model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_permissions ADD INDEX model_has_permissions_model_id_model_type_index (model_id, model_type(191))');
        DB::statement('ALTER TABLE model_has_permissions ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE');
    }
};
