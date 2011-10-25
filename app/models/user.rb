class User < ActiveRecord::Base
  include Extensions::UUID
  # Include default devise modules. Others available are:
  # :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :token_authenticatable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, :email, :password, :remember_me
  attr_accessible :authentication_token

  before_create :ensure_authentication_token
  after_create :create_profile
  
  has_one :profile  
  has_many :contests
  has_many :entries
  has_many :comments
  
  private
    def create_profile
      Profile.create(:user_id => self.id)
    end
end
