class CreateContests < ActiveRecord::Migration
  def change
    create_table :contests, :id => false do |t|
      t.integer :id, :limit => 8, :primary => true
      t.references :user, :null => false
      t.string :title, :default => ""
      t.text :content, :default => ""
      
      t.string :rules_list, :default => ""
      t.string :customized_rule, :default => ""
      
      t.decimal :credits, :precision => 8, :scale => 2, :default => 0
      t.integer :reputation, :default => 0
      
      t.boolean :is_blind, :default => false
      t.boolean :is_community, :default => false
      
      t.date :end
      t.integer :end_date, :default => 0
      
      t.integer :votes_count, :default => 0
      t.integer :entries_count, :default  => 0
      t.integer :comments_count, :default => 0

      t.timestamps
    end
    add_index :contests, :user_id
  end
end
