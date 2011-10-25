class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments, :id => false do |t|
      t.integer :id, :limit => 8, :primary => true
      t.integer :user_id, :limit => 8, :null => false
      t.integer :pixar_id, :limit => 8, :null => false
      t.text :content

      t.timestamps
    end
    add_index :comments, :user_id
    add_index :comments, :pixar_id
  end
end
