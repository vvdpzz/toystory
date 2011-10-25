class CreateProfiles < ActiveRecord::Migration
  def change
    create_table :profiles, :id => false do |t|
      t.integer :id, :limit => 8, :primary => true
      t.integer :user_id, :limit => 8, :null => false
      t.string :description
      t.string :location
      t.text :introduction
      t.string :website
      t.timestamps
    end
    add_index :profiles, :user_id
  end
end
