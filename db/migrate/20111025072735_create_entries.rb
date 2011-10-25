class CreateEntries < ActiveRecord::Migration
  def change
    create_table :entries, :id => false do |t|
      t.integer :id, :limit => 8, :primary => true
      t.integer :user_id, :limit => 8, :null => false
      t.integer :contest_id, :limit => 8, :null => false
      t.text :content, :default => ""
      
      t.boolean :is_correct, :default => false
      t.boolean :is_eliminate, :default => false
      
      t.integer :votes_count, :default => 0
      t.integer :comments_count, :default => 0

      t.timestamps
    end
    add_index :entries, :user_id
    add_index :entries, :contest_id
  end
end
