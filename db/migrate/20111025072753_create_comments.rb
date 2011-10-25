class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments, :id => false do |t|
      t.integer :id, :limit => 8, :primary => true
      t.references :user
      t.references :pixar
      t.text :content

      t.timestamps
    end
    add_index :comments, :user_id
    add_index :comments, :pixar_id
  end
end
