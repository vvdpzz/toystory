class RechargeRecord < ActiveRecord::Base
  set_primary_key 'id'
  belongs_to :user
  
  before_create :generate_uuid
  
  def generate_uuid
    self.id = Time.now.strftime("%y%m%d%H%M%S") + UUIDList.pop[0..3]
  end
end
