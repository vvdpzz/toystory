class CreateRechargeRecords < ActiveRecord::Migration
  def change
    create_table :recharge_records, :id => false do |t|
      t.integer :id, :limit => 8, :primary => true
      t.integer :user_id, :limit => 8, :null => false
      t.decimal :credits, :precision => 8, :scale => 2, :default => 0
      t.integer :trade_type, :default => 0
      t.integer :trade_status, :default => 0
      t.timestamps
    end
    add_index :recharge_records, :user_id
  end
end
